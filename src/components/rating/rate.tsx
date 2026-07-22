import {TouchableOpacity} from 'react-native';
import React from 'react';
import {Row} from '../row/row';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../theme';

interface RateProps {
  // Current rating, 0..5. Fractional values fill by rounding (a 3.6 avg shows
  // 4 filled moons).
  rate?: number;
  size?: number;
  // Color of unfilled moons; filled moons are always the app's yellow. Cards
  // over a dark hero image pass white; the detail screen passes a gray.
  emptyColor?: string;
  // When provided, each moon becomes tappable and calls back with 1..5,
  // turning this into an input (used on the ad detail screen).
  onRate?: (value: number) => void;
}

export function Rate({
  rate = 0,
  size = 18,
  emptyColor = 'white',
  onRate,
}: RateProps) {
  const filled = Math.round(rate);
  return (
    <Row style={{flexDirection: 'row'}}>
      {[1, 2, 3, 4, 5].map((value, index) => {
        const icon = (
          <IonIcons
            style={{marginHorizontal: 2}}
            size={size}
            color={index < filled ? colors.pallete.yellow : emptyColor}
            name={index < filled ? 'moon' : 'moon-outline'}
          />
        );
        if (!onRate) {
          return <React.Fragment key={value}>{icon}</React.Fragment>;
        }
        return (
          <TouchableOpacity
            key={value}
            activeOpacity={0.7}
            onPress={() => onRate(value)}
            hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
            {icon}
          </TouchableOpacity>
        );
      })}
    </Row>
  );
}
