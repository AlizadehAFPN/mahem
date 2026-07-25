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
import {colors} from '../../../theme';
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

const {width} = Dimensions.get('window');
export function CreateJobScreen() {
  const {t} = useTranslation();
  const {params} = useRoute();
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
  const {mutate: jobMutate, isLoading} = useMutation(
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
      fax,
      address,
      telegram,
      instagram,
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
  const onSelectFile = file => {
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
  const onSelectCity = city => {
    setState(s => ({...s, city, citySelectModal: false}));
  };
  const onSelectLocation = (lat: number, lng: number) => {
    setState(s => ({...s, lat, lng}));
  };

  const onChangeField = (field, value) => {
    setState(s => ({...s, [field]: value}));
  };
  return (
    <Screen withoutScroll>
      <MainHeader title={editItem ? t('jobs.editGuild') : t('jobs.createGuild')} />
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
            <SimpleLineIcons name="camera" color="black" size={60} />
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
              <SimpleLineIcons name="camera" color="black" size={40} />
            )}
          </TouchableOpacity>
        </View>
        <Divider height={8} />
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.unitName')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.title}
              onChangeText={text => onChangeField('title', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.manager')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.manager}
              onChangeText={text => onChangeField('manager', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.guildType')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <TouchableOpacity
            onPress={() => setState(s => ({...s, jobClassModal: true}))}
            style={{...styles.detailItem, flex: 1}}>
            <Text style={{...styles.itemText, textAlign: 'right'}}>
              {localizeCategory(state?.category?.title)}
            </Text>
          </TouchableOpacity>
        </Row>
        <Row style={{paddingHorizontal: 8, justifyContent: 'flex-end'}}>
          <TouchableOpacity onPress={() => navigate('jobCategoryGuide')}>
            <Text style={{fontSize: 12, color: colors.main}}>
              {t('jobs.guildGuide')}
            </Text>
          </TouchableOpacity>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.registerCode')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.register_code}
              onChangeText={text => onChangeField('register_code', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.landline')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.phone}
              onChangeText={text => onChangeField('phone', text)}
              inputMode="tel"
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.mobile')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.mobile}
              onChangeText={text => onChangeField('mobile', text)}
              inputMode="tel"
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.fax')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.fax}
              onChangeText={text => onChangeField('fax', text)}
              inputMode="tel"
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.address')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.address}
              onChangeText={text => onChangeField('address', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.telegram')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.telegram}
              onChangeText={text => onChangeField('telegram', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.instagram')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.instagram}
              onChangeText={text => onChangeField('instagram', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('common.email')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.email}
              onChangeText={text => onChangeField('email', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('common.description')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <View style={{...styles.detailItem, flex: 1}}>
            <TextField
              value={state.description}
              onChangeText={text => onChangeField('description', text)}
              style={{borderWidth: 0, height: 30}}
              inputStyle={{padding: 0, fontSize: 12, textAlign: 'right'}}
            />
          </View>
        </Row>
        <Row style={{paddingHorizontal: 8}}>
          <View style={{...styles.detailItem, width: 70}}>
            <Text style={{...styles.itemText}}>{t('jobs.city')}</Text>
          </View>
          <Divider style={{width: 10}} />
          <TouchableOpacity
            onPress={() => setState(s => ({...s, citySelectModal: true}))}
            style={{...styles.detailItem, flex: 1}}>
            <Text style={{...styles.itemText, textAlign: 'right'}}>
              {localizeCity(state?.city?.title)}
            </Text>
          </TouchableOpacity>
        </Row>
        <Divider height={8} />
        <View style={{paddingHorizontal: 8}}>
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
        <View>
          <Checkbox
            value={state.acceptance}
            onToggle={() => setState(s => ({...s, acceptance: !s.acceptance}))}
            onTextPress={() => navigate('privacy')}
            style={{flexDirection: 'row', alignSelf: 'center'}}
            text={t('createAds.acceptTerms')}
          />
        </View>
      </Screen>
      <FilePickerModal
        visible={state.filePickerModal}
        handleClose={() => setState(s => ({...s, filePickerModal: false}))}
        onSelectFile={onSelectFile}
      />
      <JobClasessModal
        onSelect={item =>
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray4,
  },
  detailItem: {
    height: 30,
    backgroundColor: colors.pallete.gray1,
    borderRadius: 4,
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  itemText: {
    lineHeight: 19,
  },
  mapPreview: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray1,
  },
  locationButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    height: 32,
    minWidth: 200,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: 'white',
  },
});
