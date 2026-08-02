import {Alert, View, StyleSheet, FlatList} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Screen, Text, Row, Checkbox, Divider, Button} from '../../components';
import {colors, scaled} from '../../theme';
import {localizeCity} from '../../i18n/display-maps';
import {useDispatch} from 'react-redux';
import {setUser} from '../../stateManager/reducers/user';
import {useMutation} from 'react-query';
import {updateUser} from '../../services';
import {useCities} from '../../hooks/use-cached-cities';

export function CitySelectionScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  // `city` holds the selected city object (id + title), not its name — an
  // empty string as the initial value made every `state.city.id` read a type
  // error while working at runtime only because handleValidation refuses to
  // submit until one is picked.
  const [state, setState] = useState<{gender: string; city: any}>({
    gender: '',
    city: null,
  });

  const {mutateAsync, isLoading} = useMutation(updateUser);
  const {data} = useCities();
  // mutateAsync + await rather than fire-and-forget mutate(): the dispatch
  // below sets cityId, which flips RootNavigator to AppStack and unmounts this
  // screen — and react-query v3 stops delivering a mutation's callbacks once
  // its observer unmounts, so there was no way to tell whether the city and
  // gender had actually been saved. Awaiting keeps the screen alive until the
  // server has confirmed, so a failure can be surfaced instead of dropping the
  // user into the app with a profile that silently never persisted.
  const handleNext = async () => {
    if (!handleValidation()) {
      return;
    }
    try {
      await mutateAsync({
        city_id: state?.city?.id,
        sex: state?.gender == 'man' ? 1 : 0,
      });
    } catch {
      Alert.alert(t('common.error'), t('auth.citySaveError'));
      return;
    }
    // Setting cityId flips RootNavigator from OnboardingStack to AppStack
    // reactively — no explicit navigate('dashboard') needed.
    dispatch(
      setUser({
        cityId: state.city.id,
        city: state.city.title,
        sex: state.gender === 'man' ? 'MALE' : 'FEMALE',
        // Seed the header's browse filter to the home city so the app opens
        // scoped to the user's own city (they can switch to «کل استان» or
        // another city from the header afterwards without changing this).
        browseCityId: state.city.id,
        browseCityName: state.city.title,
      }),
    );
  };
  const handleValidation = () => {
    const {city, gender} = state;
    if (!city || !gender) {
      return false;
    }
    return true;
  };

  const buttonEnabled = useCallback(handleValidation, [
    state.city,
    state.gender,
  ]);
  return (
    <Screen
      withoutScroll
      style={{flex: 1}}
      statusbarBackgroundColor={colors.main}
      bottomSafeAreaColor={colors.main}>
      <View style={sytles.topColor}>
        <Text
          style={{textAlign: 'center'}}
          preset="default"
          size={20}
          color="white">
          {t('auth.citySelectionIntro')}
        </Text>
      </View>
      <View style={sytles.formContainer}>
        <Text size={18}>{t('auth.gender')}</Text>
        <Row style={{paddingHorizontal: scaled(32)}}>
          <Checkbox
            value={state.gender == 'man'}
            text={t('auth.male')}
            onToggle={() => setState(s => ({...s, gender: 'man'}))}
          />
          <Divider style={{width: scaled(20)}} />
          <Checkbox
            value={state.gender == 'woman'}
            text={t('auth.female')}
            onToggle={() => setState(s => ({...s, gender: 'woman'}))}
          />
        </Row>
        <Divider />
        <Text size={18}>{t('auth.residenceCity')}</Text>
        <View style={{paddingHorizontal: scaled(32)}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data?.data}
            // Key by the unique city id, not the display title — Iranian city
            // names can repeat, and two rows sharing a key triggers React's
            // "Encountered two children with the same key" warning (and can
            // mis-recycle rows). The inner `key` on Checkbox was redundant
            // (FlatList keys cells via keyExtractor) and had the same flaw.
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => (
              <Checkbox
                text={localizeCity(item.title)}
                value={state.city?.id === item.id}
                onToggle={() => setState(s => ({...s, city: item}))}
              />
            )}
            ListFooterComponent={<Divider height={500} />}
          />
        </View>
      </View>
      <Button
        loading={isLoading}
        onPress={handleNext}
        disabled={!buttonEnabled() || isLoading}
        style={{
          ...sytles.button,
          backgroundColor: buttonEnabled() ? colors.main : colors.pallete.gray1,
          borderWidth: buttonEnabled() ? 0 : 1,
        }}>
        <Text size={17} color={buttonEnabled() ? 'white' : 'black'}>
          {t('common.confirm')}
        </Text>
      </Button>
    </Screen>
  );
}
const sytles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    height: scaled(137),
    padding: scaled(16),
    justifyContent: 'center',
  },
  cammeraButton: {
    width: scaled(94),
    height: scaled(94),
    borderRadius: scaled(50),
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaled(-47),
    alignSelf: 'center',
    backgroundColor: colors.pallete.gray1,
    overflow: 'hidden',
  },
  formContainer: {
    paddingHorizontal: scaled(32),
    paddingTop: scaled(16),
  },
  button: {
    height: scaled(50),
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeContainer: {
    alignItems: 'center',
  },
});
