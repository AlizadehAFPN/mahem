import {Alert, Dimensions, Image, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  Divider,
  GradiantHeader,
  MainHeader,
  Screen,
  Row,
  Text,
  ProductLocation,
} from '../../../components';
import {colors, scaled} from '../../../theme';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {deleteJob, getSingleJob, renewJob} from '../../../services/job';
import {localizeCategory} from '../../../i18n/display-maps';
import {RootState} from '../../../stateManager';
import {useMissingEntityGuard} from '../../../hooks/use-missing-entity-guard';
import {fieldStyles, useLabelColumnWidth} from './field-cell';
import {jobFields} from './job-fields';
import {buildJobLink} from '../../../navigation/deep-links';
const {width} = Dimensions.get('window');

/**
 * What renewing this job costs — by rule, whatever posting it cost.
 *
 * That is how ad renewal already works (UserPanelScreen's onRenewAd reads
 * Category.adFeeToman, the same figure CreateAdsPaymentScreen charged), and
 * jobs follow it: whatever fee the job's صنف carries at creation is the fee
 * to renew at.
 *
 * Today no job category carries one — CreateJobScreen never goes through the
 * gateway, so a job is free to post — and the value is therefore 0. The old
 * hardcoded `JOB_RENEWAL_FEE_TOMAN = 0` produced the same number, but as a
 * placeholder rather than a reading, so it also sent the user to a bank
 * gateway asking for «۰ تومان». See onRenewJob for what happens instead.
 */
function jobRenewalFeeToman(job: any): number {
  return Number(job?.job_category_id?.adFeeToman ?? 0) || 0;
}
export function SingleJobScreen() {
  const {t} = useTranslation();
  const {params} = useRoute<any>();
  const {navigate, goBack} = useNavigation<any>();
  const [job, setJob] = useState(params?.job);
  const user = useSelector((s: RootState) => s.user);
  const isOwner = job?.userId && job.userId === user?.id;
  const queryClient = useQueryClient();

  // Every list that opens this screen hands over the whole job object, but a
  // JOB_APPROVED/JOB_REJECTED notification tap only has an id — fill in the
  // rest (including the rejection reason, which no list carries) from the API.
  const jobId = params?.job?.id;
  const missingJobGuard = useMissingEntityGuard('jobs.jobDeleted');
  const {data: fetchedJob} = useQuery(
    ['singleJob', jobId],
    () => getSingleJob(jobId),
    {enabled: !!jobId && !params?.job?.title, ...missingJobGuard},
  );
  useEffect(() => {
    if (fetchedJob?.data) {
      setJob(fetchedJob.data);
    }
  }, [fetchedJob]);
  const {mutate: deleteJobMutate} = useMutation(() => deleteJob(job.id), {
    onSuccess: () => {
      queryClient.invalidateQueries('categoryJobs');
      goBack();
    },
  });
  const isRejected = job?.approvalStatus === 'REJECTED';
  const onDeleteJob = () => {
    Alert.alert(
      isRejected
        ? t('userPanel.deleteAdCompletelyTitle')
        : t('userPanel.deleteAdTitle'),
      isRejected
        ? t('userPanel.deleteRejectedBody')
        : t('userPanel.deleteConfirmBody'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: isRejected
            ? t('userPanel.deleteCompletely')
            : t('common.delete'),
          style: 'destructive',
          onPress: () => deleteJobMutate(),
        },
      ],
    );
  };

  const submitRenewal = async () => {
    try {
      await renewJob(job.id);
      goBack();
      Alert.alert(t('store.renewRequested'), t('userPanel.renewRequestedBody'));
    } catch (e) {
      Alert.alert(t('common.error'), t('store.renewError'));
    }
  };

  const onRenewJob = () => {
    const fee = jobRenewalFeeToman(job);

    // No fee, no checkout. Sending someone to a card-number form to pay
    // «۰ تومان» is the kind of thing that makes a user distrust the whole
    // flow — and there is nothing for an admin to confirm afterwards either.
    // A priced job category (see jobRenewalFeeToman) goes through the gateway
    // exactly like a paid ad does.
    if (fee <= 0) {
      submitRenewal();
      return;
    }

    navigate('bankGateway', {
      amount: fee,
      description: t('userPanel.renewAdDescription', {title: job?.title ?? ''}),
      onSuccess: submitRenewal,
    });
  };
  const jobObj = useMemo(() => jobFields(job, t), [job, t]);

  const {labelWidth, labelMeasurer} = useLabelColumnWidth(
    jobObj.map(item => item.title),
  );

  return (
    <Screen withoutScroll>
      <MainHeader
        title={localizeCategory(job?.job_category_id?.title)}
        showBack
      />
      <View style={styles.nav}>
        <GradiantHeader
          shareText={job?.title}
          shareLink={job?.id ? buildJobLink(job.id) : undefined}
        />
      </View>
      <Screen unsafe>
        <View style={styles.bannerContaier}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: job?.banner}}
          />
        </View>
        <View style={styles.grayCard}>
          <View style={styles.circle}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={{uri: job?.logo}}
            />
          </View>
        </View>
        <Divider height={8} />
        {isOwner && isRejected && job?.rejectionReason && (
          <Text
            style={{
              paddingHorizontal: scaled(8),
              marginBottom: scaled(4),
              textAlign: 'center',
            }}
            size={12}
            color={colors.pallete.red2}>
            {t('jobs.adRejected', {reason: job.rejectionReason})}
          </Text>
        )}
        {isOwner && job?.status === 'ARCHIVED' && (
          <Text
            style={{
              paddingHorizontal: scaled(8),
              marginBottom: scaled(4),
              textAlign: 'center',
            }}
            size={12}
            color={colors.pallete.red2}>
            {t('jobs.adArchivedNotice')}
          </Text>
        )}
        {isOwner && (
          <Row style={{paddingHorizontal: scaled(8), marginBottom: scaled(4)}}>
            {isRejected ? (
              <Button onPress={onDeleteJob} style={styles.ownerActionButton}>
                <Text size={13} color={colors.pallete.red2}>
                  {t('userPanel.deleteCompletely')}
                </Text>
              </Button>
            ) : (
              <>
                <Button
                  onPress={() => navigate('createJob', {editItem: job})}
                  style={styles.ownerActionButton}>
                  <Text size={13} color={colors.main}>
                    {t('common.edit')}
                  </Text>
                </Button>
                <Divider style={{width: scaled(10)}} />
                <Button onPress={onDeleteJob} style={styles.ownerActionButton}>
                  <Text size={13} color={colors.pallete.red2}>
                    {t('common.delete')}
                  </Text>
                </Button>
              </>
            )}
          </Row>
        )}
        {isOwner && !isRejected && job?.approvalStatus === 'APPROVED' && (
          <Row style={{paddingHorizontal: scaled(8), marginBottom: scaled(4)}}>
            <Button
              onPress={onRenewJob}
              style={{...styles.ownerActionButton, ...styles.renewButton}}>
              <Text size={13} color="white">
                {job.status === 'ARCHIVED'
                  ? t('userPanel.renewAdExpired')
                  : t('userPanel.renewAd')}
              </Text>
            </Button>
          </Row>
        )}
        {jobObj.map(item => (
          <Row key={item.title} style={{paddingHorizontal: scaled(8)}}>
            <View style={{...fieldStyles.cell, width: labelWidth}}>
              <Text>{item.title}</Text>
            </View>
            <Divider style={{width: scaled(10)}} />
            <View style={{...fieldStyles.cell, flex: 1}}>
              <Text style={{textAlign: item.phone ? 'left' : 'right'}}>
                {item.value}
              </Text>
            </View>
          </Row>
        ))}
        {labelMeasurer}
        <ProductLocation
          lat={job?.lat}
          lng={job?.lng}
          zoomEnabled={false}
          scrollEnabled={false}
        />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerContaier: {
    width: '100%',
    height: width / 1.9,
  },
  ownerActionButton: {
    flex: 1,
    height: scaled(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(6),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  renewButton: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: scaled(50),
  },
  grayCard: {
    height: scaled(55),
    backgroundColor: colors.pallete.gray1,
  },
  circle: {
    height: scaled(94),
    width: scaled(94),
    borderRadius: scaled(50),
    marginTop: scaled(-47),
    borderWidth: 1,
    marginLeft: scaled(20),
    overflow: 'hidden',
  },
});
