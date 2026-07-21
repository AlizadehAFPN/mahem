import {Modal, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {SelectLocation} from '../map-components/select-location';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {colors} from '../../theme';

interface LocationSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

// Lets the user drop an exact pin on the map when creating an ad, in
// addition to (not instead of) picking a city — CitySelectModal only ever
// captured the city, never coordinates, so an ad's map on the detail screen
// always fell back to the hardcoded default region.
export function LocationSelectModal({
  visible,
  onClose,
  onSelect,
}: LocationSelectModalProps) {
  const [pending, setPending] = useState<{lat: number; lng: number} | null>(
    null,
  );

  const handleConfirm = () => {
    if (pending) {
      onSelect(pending.lat, pending.lng);
      setPending(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text preset="bold" size={16} style={{textAlign: 'center', padding: 12}}>
          روی نقشه، موقعیت دقیق آگهی را انتخاب کنید
        </Text>
        <SelectLocation
          style={styles.map}
          onSelect={(lat: number, lng: number) => setPending({lat, lng})}
        />
        <Row style={styles.footer}>
          <Button style={styles.cancelButton} onPress={onClose}>
            <Text>انصراف</Text>
          </Button>
          <Button
            style={pending ? styles.confirmButton : styles.confirmButtonDisabled}
            disabled={!pending}
            onPress={handleConfirm}>
            <Text color="white">تایید موقعیت</Text>
          </Button>
        </Row>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  footer: {
    padding: 16,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    marginEnd: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  confirmButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.main,
  },
  confirmButtonDisabled: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.main,
    opacity: 0.5,
  },
});
