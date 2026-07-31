import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {
  Divider,
  GradiantHeader,
  MainHeader,
  Screen,
  Row,
  Text,
  ProductLocation,
  FilePickerModal,
  TextField,
  JobClasessModal,
  Checkbox,
  CitySelectModal,
} from '../../../components';
import {LocationSelectModal} from '../../../components/modal/location-select-modal';
import {colors, scaled} from '../../../theme';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useTranslation} from 'react-i18next';
import {useMutation} from 'react-query';
import {upload} from '../../../services';
import {createJob, updateJob} from '../../../services/job';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../../utiles/utiles_funcs';
import {localizeCategory, localizeCity} from '../../../i18n/display-maps';
import {fieldStyles, useLabelColumnWidth} from './field-cell';

const {width} = Dimensions.get('window');
// Every label this form puts in its left-hand column, in the order they are
// rendered — the column is sized off them rather than off a fixed width, see
// field-cell.
const FIELD_LABEL_KEYS = [
  'jobs.unitName',
  'jobs.manager',
  'jobs.guildType',
  'jobs.registerCode',
  'jobs.landline',
  'jobs.mobile',
  'jobs.fax',
  'jobs.address',
  'jobs.telegram',
  'jobs.instagram',
  'common.email',
  'common.description',
  'jobs.city',
];
export function CreateJobScreen() {
  const {t} = useTranslation();
  const {params} = useRoute<any>();
  const editItem = params?.editItem;
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          banner: editItem.banner ? {uri: editItem.banner} : '',
          avatar: editItem.logo ? {uri: editItem.logo} : '',
          tempSelect: '',
          filePickerModal: false,
          jobClassModal: false,
          category: editItem.job_category_id ?? '',
          acceptance: true,
          telegram: editItem.telegram ?? '',
          instagram: editItem.instagram ?? '',
          fax: editItem.fax ?? '',
          phone: editItem.phone ?? '',
          mobile: editItem.mobile ?? '',
          description: editItem.description ?? '',
          address: editItem.address ?? '',
          register_code: editItem.registerCode ?? '',
          email: editItem.email ?? '',
          manager: editItem.manager ?? '',
          city: editItem.city
            ? {id: editItem.cityId, title: editItem.city.name}
            : '',
          citySelectModal: false,
          lat: editItem.lat ?? undefined,
          lng: editItem.lng ?? undefined,
          locationModal: false,
          uploadedBanner: editItem.banner ? {id: editItem.banner} : undefined,
          uploadedLogo: editItem.logo ? {id: editItem.logo} : undefined,
        }
      : {
          title: '',
          banner: '',
          avatar: '',
          tempSelect: '',
          filePickerModal: false,
          jobClassModal: false,
          // Pre-filled when arriving from a category's own "+" button
          // (SingleJobCategoryScreen) so the user isn't asked to pick the
          // same category again right after they just navigated into it.
          category: params?.category ?? '',
          acceptance: false,
          telegram: '',
          instagram: '',
          fax: '',
          phone: '',
          mobile: '',
          description: '',
          address: '',
          register_code: '',
          email: '',
          manager: '',
          city: '',
          citySelectModal: false,
          lat: undefined,
          lng: undefined,
          locationModal: false,
          uploadedBanner: undefined,
          uploadedLogo: undefined,
        },
  );
  const {goBack, navigate} = useNavigation<any>();

  const {mutate} = useMutation(upload);
  const {mutate: jobMutate} = useMutation(
    editItem ? (data: any) => updateJob(editItem.id, data) : createJob,
  );

  const handleValidation = () => {
    const {
      manager,
      title,
      category,
      register_code,
      phone,
      mobile,
      address,
      city,
      acceptance,
    } = state;
    if (!title) {
      Alert.alert(t('jobs.validation.enterUnitName'));
      return false;
    } else if (!manager) {
      Alert.alert(t('jobs.validation.enterManager'));
      return false;
    } else if (!category) {
      Alert.alert(t('jobs.validation.selectGuildType'));
      return false;
    } else if (!register_code) {
      Alert.alert(t('jobs.validation.enterRegisterCode'));
      return false;
    } else if (!phone) {
      Alert.alert(t('jobs.validation.enterPhone'));
      return false;
    } else if (!mobile) {
      Alert.alert(t('jobs.validation.enterMobile'));
      return false;
    } else if (!address) {
      Alert.alert(t('jobs.validation.enterAddress'));
      return false;
    } else if (!city) {
      Alert.alert(t('jobs.validation.enterCity'));
      return false;
    } else if (!acceptance) {
      Alert.alert(t('jobs.validation.mustAcceptTerms'));
      return false;
    }
    return true;
  };

  const handleCreateJob = () => {
    if (handleValidation()) {
      const {
        title,
        manager,
        category,
        phone,
        register_code,
        mobile,
        fax,
        address,
        telegram,
        instagram,
        email,
        description,
        city,
        lat,
        lng,
        uploadedBanner,
        uploadedLogo,
      } = state;
      const data = {
        title,
        manager,
        job_category_id: category?.id,
        phone,
        register_code,
        mobile,
        fax,
        address,
        telegram,
        instagram,
        email,
        description,
        city_id: city?.id,
        lat,
        lng,
        banner: uploadedBanner?.id,
        logo: uploadedLogo?.id,
      };
      jobMutate(data, {
        onSuccess: () => {
          if (editItem) {
            // Editing resets the job posting to PENDING on the backend for
            // re-review (see jobs.service.ts CONTENT_FIELDS) without
            // touching paymentStatus — an already-confirmed payment stays
            // confirmed, no repeat payment needed.
            Alert.alert(t('jobs.editedTitle'), t('jobs.editedBody'), [
              {text: t('common.ok'), onPress: goBack},
            ]);
          } else {
            goBack();
          }
        },
      });
    }
  };

  const onPressBanner = () => {
    setState(s => ({...s, filePickerModal: true, tempSelect: 'banner'}));
  };

  const onPressAvatar = () => {
    setState(s => ({...s, filePickerModal: true, tempSelect: 'avatar'}));
  };
  const onSelectFile = (file: any) => {
    if (!isSupportedImageType(file.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    setState(s => ({...s, [s.tempSelect]: file}));
    const {fileName, type, uri} = file;
    const doc = {name: fileName, type, uri};
    const form = new FormData();
    form.append('file', doc);
    mutate(form, {
      onSuccess: data => {
        const field =
          state.tempSelect === 'banner' ? 'uploadedBanner' : 'uploadedLogo';
        setState(s => ({...s, [field]: data?.data}));
      },
    });
  };
  const onSelectCity = (city: any) => {
    setState(s => ({...s, city, citySelectModal: false}));
  };
  const onSelectLocation = (lat: number, lng: number) => {
    setState(s => ({...s, lat, lng}));
  };

  const onChangeField = (field: any, value: any) => {
    setState(s => ({...s, [field]: value}));
  };
  const {labelWidth, labelMeasurer} = useLabelColumnWidth(
    FIELD_LABEL_KEYS.map(key => t(key)),
  );
  const labelCell = {
    ...fieldStyles.cell,
    ...styles.formCell,
    width: labelWidth,
  };
  const valueCell = {...fieldStyles.cell, ...styles.formCell, flex: 1};
  // TextField's `default` preset carries a height of its own, which is what
  // used to hold the text to 30pt whatever it needed: unset it and keep the 30
  // as a floor, so a field whose text is drawn taller (a larger system font)
  // grows the row instead of spilling out of it.
  const fieldContainer = {borderWidth: 0, height: undefined, minHeight: 30};
  return (
    <Screen withoutScroll>
      <MainHeader
        title={editItem ? t('jobs.editGuild') : t('jobs.createGuild')}
      />
      <View style={styles.nav}>
        <GradiantHeader
          details={false}
          create
          onCreatePress={handleCreateJob}
        />
      </View>
      <Screen unsafe>
        <TouchableOpacity onPress={onPressBanner} style={styles.bannerContaier}>
          {state.banner ? (
            <Image
              style={{width: '100%', height: '100%'}}
              source={{uri: state?.banner?.uri}}
            />
          ) : (
            <SimpleLineIcons name="camera" color="black" size={scaled(60)} />
          )}
        </TouchableOpacity>
        <View style={styles.grayCard}>
          <TouchableOpacity onPress={onPressAvatar} style={styles.circle}>
            {state.avatar ? (
              <Image
                style={{height: '100%', width: '100%'}}
                source={{uri: state.avatar?.uri}}
              />
            ) : (
              <SimpleLineIcons name="camera" color="black" size={scaled(40)} />
            )}
          </TouchableOpacity>
        </View>
        <Divider height={8} />
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.unitName')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.title}
              onChangeText={text => onChangeField('title', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.manager')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.manager}
              onChangeText={text => onChangeField('manager', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.guildType')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <TouchableOpacity
            onPress={() => setState(s => ({...s, jobClassModal: true}))}
            style={valueCell}>
            <Text style={{textAlign: 'right'}}>
              {localizeCategory(state?.category?.title)}
            </Text>
          </TouchableOpacity>
        </Row>
        <Row style={{paddingHorizontal: scaled(8), justifyContent: 'flex-end'}}>
          <TouchableOpacity onPress={() => navigate('jobCategoryGuide')}>
            <Text style={{fontSize: scaled(12), color: colors.main}}>
              {t('jobs.guildGuide')}
            </Text>
          </TouchableOpacity>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.registerCode')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.register_code}
              onChangeText={text => onChangeField('register_code', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.landline')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.phone}
              onChangeText={text => onChangeField('phone', text)}
              inputMode="tel"
              phoneNumber
              style={fieldContainer}
              inputStyle={{padding: 0, fontSize: scaled(12)}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.mobile')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.mobile}
              onChangeText={text => onChangeField('mobile', text)}
              inputMode="tel"
              phoneNumber
              style={fieldContainer}
              inputStyle={{padding: 0, fontSize: scaled(12)}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.fax')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.fax}
              onChangeText={text => onChangeField('fax', text)}
              inputMode="tel"
              phoneNumber
              style={fieldContainer}
              inputStyle={{padding: 0, fontSize: scaled(12)}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.address')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.address}
              onChangeText={text => onChangeField('address', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.telegram')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.telegram}
              onChangeText={text => onChangeField('telegram', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.instagram')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.instagram}
              onChangeText={text => onChangeField('instagram', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('common.email')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.email}
              onChangeText={text => onChangeField('email', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('common.description')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <View style={valueCell}>
            <TextField
              value={state.description}
              onChangeText={text => onChangeField('description', text)}
              style={fieldContainer}
              inputStyle={{
                padding: 0,
                fontSize: scaled(12),
                textAlign: 'right',
              }}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: scaled(8)}}>
          <View style={labelCell}>
            <Text>{t('jobs.city')}</Text>
          </View>
          <Divider style={{width: scaled(10)}} />
          <TouchableOpacity
            onPress={() => setState(s => ({...s, citySelectModal: true}))}
            style={valueCell}>
            <Text style={{textAlign: 'right'}}>
              {localizeCity(state?.city?.title)}
            </Text>
          </TouchableOpacity>
        </Row>
        {labelMeasurer}
        {/* Closes the form, before the map rather than after it: the terms are
            about what is being submitted, and the map is the last thing the
            screen asks for. */}
        <Divider height={8} />
        <View>
          <Checkbox
            value={state.acceptance}
            onToggle={() => setState(s => ({...s, acceptance: !s.acceptance}))}
            onTextPress={() => navigate('privacy')}
            style={{flexDirection: 'row', alignSelf: 'center'}}
            text={t('createAds.acceptTerms')}
          />
        </View>
        <Divider height={8} />
        <View style={{paddingHorizontal: scaled(8)}}>
          <View style={styles.mapPreview}>
            <ProductLocation
              lat={state.lat}
              lng={state.lng}
              zoomEnabled={false}
              scrollEnabled={false}
              pointerEvents="none"
            />
          </View>
          <TouchableOpacity
            onPress={() => setState(s => ({...s, locationModal: true}))}
            style={styles.locationButton}>
            <Text size={15} style={{textAlign: 'center'}}>
              {t('jobs.selectLocationOnMap')}
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
      <FilePickerModal
        visible={state.filePickerModal}
        handleClose={() => setState(s => ({...s, filePickerModal: false}))}
        onSelectFile={onSelectFile}
      />
      <JobClasessModal
        onSelect={(item: any) =>
          setState(s => ({...s, category: item, jobClassModal: false}))
        }
        visible={state.jobClassModal}
        onClose={() => setState(s => ({...s, jobClassModal: false}))}
      />
      <CitySelectModal
        onSelect={onSelectCity}
        visible={state.citySelectModal}
        onClose={() => setState(s => ({...s, citySelectModal: false}))}
      />
      <LocationSelectModal
        visible={state.locationModal}
        onSelect={onSelectLocation}
        onClose={() => setState(s => ({...s, locationModal: false}))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerContaier: {
    width: '100%',
    height: width / 1.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.pallete.gray3,
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray4,
  },
  // A form row is taller than a row on the detail screen because it holds an
  // input rather than a line of text; that is the only thing this adds to the
  // shared cell, and it is still a floor rather than a height.
  formCell: {
    minHeight: scaled(30),
    paddingVertical: 0,
  },
  mapPreview: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: scaled(8),
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray1,
  },
  locationButton: {
    alignSelf: 'center',
    marginTop: scaled(8),
    marginBottom: scaled(4),
    height: scaled(32),
    minWidth: scaled(200),
    paddingHorizontal: scaled(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(7),
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: 'white',
  },
});
