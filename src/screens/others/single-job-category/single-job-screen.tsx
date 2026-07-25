import {Alert, Dimensions, Image, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
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
import {colors} from '../../../theme';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useMutation, useQueryClient} from 'react-query';
import {deleteJob, renewJob} from '../../../services/job';
import {localizeCategory} from '../../../i18n/display-maps';
const {width} = Dimensions.get('window');

// There's no established job-posting fee anywhere in the app today (unlike
// Advertisement's Category.adFeeToman or Store's STORE_FEE_TOMAN) — Job
// payment has always been an admin-confirmed manual/negotiated arrangement
// (see JobsService.confirmPayment's doc comment). This is a placeholder
// display figure for the gateway screen until an actual amount is decided.
const JOB_RENEWAL_FEE_TOMAN = 0;
export function SingleJobScreen() {
  const {t} = useTranslation();
  const {params} = useRoute();
  const {navigate, goBack} = useNavigation<any>();
  const [job, setJob] = useState(params?.job);
  const user = useSelector(s => s.user);
  const isOwner = job?.userId && job.userId === user?.id;
  const queryClient = useQueryClient();
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
          text: isRejected ? t('userPanel.deleteCompletely') : t('common.delete'),
          style: 'destructive',
          onPress: () => deleteJobMutate(),
        },
      ],
    );
  };

  const onRenewJob = () => {
    navigate('bankGateway', {
      amount: JOB_RENEWAL_FEE_TOMAN,
      description: t('userPanel.renewAdDescription', {title: job?.title ?? ''}),
      onSuccess: async () => {
        try {
          await renewJob(job.id);
          goBack();
          Alert.alert(
            t('store.renewRequested'),
            t('userPanel.renewRequestedBody'),
          );
        } catch (e) {
          Alert.alert(t('common.error'), t('store.renewError'));
        }
      },
    });
  };
  const jobObj = useMemo(() => {
    if (job) {
      const {
        title,
        manager,
        register_code,
        phone,
        mobile,
        fax,
        address,
        telegram,
        instagram,
        email,
        description,
        job_category_id,
      } = job;
      return [
        {title: t('jobs.unitName'), value: title},
        {title: t('jobs.manager'), value: manager},
        {title: t('jobs.guildType'), value: localizeCategory(job_category_id.title)},
        {title: t('jobs.registerCode'), value: register_code},
        {title: t('jobs.landline'), value: phone},
        {title: t('jobs.mobile'), value: mobile},
        {title: t('jobs.fax'), value: fax},
        {title: t('jobs.address'), value: address},
        {title: t('jobs.telegram'), value: telegram},
        {title: t('jobs.instagram'), value: instagram},
        {title: t('common.email'), value: email},
        {title: t('common.description'), value: description},
      ];
    }
    return [];
  }, [job, t]);

  return (
    <Screen withoutScroll>
      <MainHeader title={localizeCategory(job?.job_category_id?.title)} showBack />
      <View style={styles.nav}>
        <GradiantHeader shareText={job?.title} />
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
              paddingHorizontal: 8,
              marginBottom: 4,
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
              paddingHorizontal: 8,
              marginBottom: 4,
              textAlign: 'center',
            }}
            size={12}
            color={colors.pallete.red2}>
            {t('jobs.adArchivedNotice')}
          </Text>
        )}
        {isOwner && (
          <Row style={{paddingHorizontal: 8, marginBottom: 4}}>
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
                <Divider style={{width: 10}} />
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
          <Row style={{paddingHorizontal: 8, marginBottom: 4}}>
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
          <Row key={item.title} style={{paddingHorizontal: 8}}>
            <View style={{...styles.detailItem, width: 70}}>
              <Text style={{...styles.itemText}}>{item.title}</Text>
            </View>
            <Divider style={{width: 10}} />
            <View style={{...styles.detailItem, flex: 1}}>
              <Text style={{...styles.itemText, textAlign: 'right'}}>
                {item.value}
              </Text>
            </View>
          </Row>
        ))}
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
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
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
    top: 50,
  },
  grayCard: {
    height: 55,
    backgroundColor: colors.pallete.gray1,
  },
  circle: {
    height: 94,
    width: 94,
    borderRadius: 50,
    marginTop: -47,
    borderWidth: 1,
    marginLeft: 20,
    overflow: 'hidden',
  },
  detailItem: {
    height: 19,
    backgroundColor: colors.pallete.gray1,
    borderRadius: 4,
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  itemText: {
    lineHeight: 19,
  },
});
