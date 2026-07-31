import {Image, Linking, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {CityPicker, MainHeader, Screen, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {useLanguage} from '../../../Context/LanguageContext';
import {useMutation} from 'react-query';
import {logout, updateUser} from '../../../services';
import {removeUser, setUserCity} from '../../../stateManager/reducers/user';
import {RootState} from '../../../stateManager';
import {localizeCity} from '../../../i18n/display-maps';
import {APP_STORE_URL} from '../../../navigation/deep-links';

// Figma «تنظیمات» (106:1299) uses a slim 36×14 pill switch — the platform
// Switch can't be sized down to it, so it's rebuilt here. The "thumb" in the
// design is really the *unfilled* tail of the track: the accent pill fills 24
// of the 36pt from one end and the remaining 12pt stay white.
const SWITCH_ON = '#7BED8D';
const SWITCH_OFF = '#748A9D';
// The city field's underline (node 106:1324) is an open box, not a plain rule:
// a 1pt bottom line with 3pt ticks turning up at both ends.
const UNDERLINE = '#FF0000';

function LanguageOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{top: 14, bottom: 14, left: 8, right: 8}}
      style={styles.languageOption}>
      <View
        style={[
          styles.switchTrack,
          {borderColor: active ? SWITCH_ON : SWITCH_OFF},
        ]}>
        <View
          style={[
            styles.switchFill,
            active ? styles.switchFillOn : styles.switchFillOff,
            {backgroundColor: active ? SWITCH_ON : SWITCH_OFF},
          ]}
        />
      </View>
      <Text size={15} style={styles.languageLabel}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Settings() {
  const dispatch = useDispatch();
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const {translate, changeLanguage, language} = useLanguage();
  const isPersian = language === 'fa';
  const user = useSelector((s: RootState) => s.user);
  const {navigate} = useNavigation<any>();

  const {mutate} = useMutation(updateUser);

  // A trailing colon is bidi-neutral: with the app's native layout left-to-
  // right it would sit to the *right* of a Persian label, while the design
  // puts it on the left. An RLM right after it pulls it into the RTL run.
  const withColon = (label: string) => `${label}:${isPersian ? '\u200F' : ''}`;

  const onSelectCity = (item: any) => {
    mutate(
      {city_id: item.id},
      {
        onSuccess: () => {},
      },
    );
    dispatch(setUserCity({city: item.title, cityId: item.id}));
    setCityModalVisible(false);
  };
  const onExit = () => {
    // Revoke the refresh token server-side first (best-effort — a network
    // failure here shouldn't block the user from signing out locally).
    logout().catch(() => {});
    // Clearing the token flips RootNavigator from AppStack to AuthStack
    // reactively — an explicit reset() would target 'login' inside the
    // wrong stack now that navigation is split into Auth/ProfileSetup/
    // Onboarding/App.
    dispatch(removeUser());
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title={translate('settings.title')} showBack />

      {/* Shared grey wordmark band (nodes 106:1338 / 106:1339) — same strip
          the about/contact screens render. */}
      <View style={styles.logoBand}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require('../../../assets/images/hlogo.png')}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>
          {withColon(translate('settings.chooseLanguage'))}
        </Text>
        <View style={styles.languageRow}>
          {/* Endonyms on purpose: each option names its own language, so
              «فارسی» stays «فارسی» while the UI is in English. */}
          <LanguageOption
            label="English"
            active={!isPersian}
            onPress={() => changeLanguage('en')}
          />
          <LanguageOption
            label="فارسی"
            active={isPersian}
            onPress={() => changeLanguage('fa')}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.cityLabel]}>
          {withColon(translate('settings.chooseCity'))}
        </Text>
        <TouchableOpacity
          onPress={() => setCityModalVisible(true)}
          activeOpacity={0.8}
          style={styles.cityField}>
          {user?.city ? (
            <Text size={15}>{localizeCity(user.city)}</Text>
          ) : (
            <Text size={12} style={styles.cityHint}>
              {translate('settings.cityHint')}
            </Text>
          )}
          <View style={styles.cityUnderline} />
        </TouchableOpacity>
        <CityPicker
          visible={cityModalVisible}
          onClose={() => setCityModalVisible(false)}
          onSelect={onSelectCity}
        />

        <TouchableOpacity
          onPress={() => navigate('editProfile' as never)}
          style={[styles.actionRow, styles.firstActionRow]}>
          <Text size={17}>
            {translate('settings.editProfile')} ({user?.username})
          </Text>
        </TouchableOpacity>

        {/* Hidden until there is a listing to rate. The URL here was
            https://cafebazaar.ir/app/com.turner.asmajormayhem — an unrelated
            game left over from the template — so the row sent anyone who
            tapped it to someone else's app. Set APP_STORE_URL (deep-links.ts)
            once the app is published and the row comes back on its own. */}
        {!!APP_STORE_URL && (
          <TouchableOpacity
            onPress={() => Linking.openURL(APP_STORE_URL)}
            style={styles.actionRow}>
            <Text size={17}>{translate('settings.rateMahem')}</Text>
          </TouchableOpacity>
        )}

        {/* Not in the Figma frame, but the screen is the only way out of the
            account — kept, styled like the rows above it. */}
        <TouchableOpacity onPress={onExit} style={styles.actionRow}>
          <Text size={17}>{translate('settings.exit')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 102pt band holding the 367×47 wordmark 22pt from its top (node 106:1338).
  logoBand: {
    width: '100%',
    paddingTop: scaled(22),
    paddingBottom: scaled(33),
    backgroundColor: colors.pallete.gray1,
  },
  logo: {
    width: '100%',
    height: scaled(47),
  },
  body: {
    flex: 1,
    paddingHorizontal: scaled(20),
    paddingTop: scaled(4),
  },
  sectionLabel: {
    fontSize: scaled(17),
  },
  // The design insets the two options well inside the page margin (60pt from
  // each edge of the 360pt frame) rather than spreading them full width.
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: scaled(40),
    marginTop: scaled(14),
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTrack: {
    width: scaled(36),
    height: scaled(14),
    borderRadius: scaled(7),
    borderWidth: 1,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  switchFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: scaled(22),
    borderRadius: scaled(7),
  },
  switchFillOn: {left: 0},
  switchFillOff: {right: 0},
  languageLabel: {
    marginLeft: scaled(6),
    color: colors.pallete.gray2,
  },
  cityLabel: {
    marginTop: scaled(16),
  },
  cityField: {
    marginHorizontal: scaled(24),
    marginTop: scaled(11),
    paddingTop: scaled(8),
  },
  cityHint: {
    color: colors.pallete.gray2,
  },
  cityUnderline: {
    height: scaled(3),
    marginTop: 2,
    borderColor: UNDERLINE,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  actionRow: {
    paddingVertical: scaled(10),
    marginTop: scaled(12),
  },
  firstActionRow: {
    marginTop: scaled(16),
  },
});
