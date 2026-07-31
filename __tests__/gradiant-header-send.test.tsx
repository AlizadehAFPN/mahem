/**
 * GradiantHeader's «ارسال» action (the create/edit صنف form's submit button).
 * It sits on a gradient the caller chooses, so its colour has to follow the
 * header's own iconColor: hard-coded white made it invisible on the white
 * gradient the header defaults to, which is what the job form uses.
 */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {GradiantHeader} from '../src/components/headers/gradiant-header';
import {Text} from '../src/components/text/text';

// Native/ESM-only modules the header pulls in; none of them takes part in what
// is being asserted here.
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/Octicons', () => 'Octicons');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/Feather', () => 'Feather');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: () => {}}),
}));

function sendButtonColors(iconColor?: string) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <GradiantHeader
        title=""
        colors={undefined}
        details={false}
        create
        onCreatePress={() => {}}
        onBookMark={undefined}
        shareText=""
        {...(iconColor ? {iconColor} : null)}
      />,
    );
  });
  return {
    label: tree!.root
      .findAllByType(Text)
      .map(node => node.props.color)
      .pop(),
    check: tree!.root.findByType('Feather' as any).props.color,
  };
}

describe('GradiantHeader send button', () => {
  it('is drawn dark on the header the job form uses', () => {
    expect(sendButtonColors()).toEqual({label: 'black', check: 'black'});
  });

  it('follows the header into white where the gradient is dark', () => {
    expect(sendButtonColors('white')).toEqual({label: 'white', check: 'white'});
  });
});
