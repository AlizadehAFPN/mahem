/**
 * Tapping a photo on the ad-detail page opens it full-screen, the way tapping
 * an image message in a chat thread does. The slider is shared with the home
 * banners, though, where a tap opens the banner's own link instead — so the
 * two behaviours have to stay separate, and the empty-state fallback (a
 * bundled asset with no uri) must not open anything at all.
 */
import React from 'react';
import {Linking, TouchableOpacity} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {ImageSlider} from '../src/components/image-slider/image-slider';

// The carousel drives its own animations off native reanimated internals;
// rendering every item straight through is all this test needs from it.
jest.mock('react-native-reanimated-carousel', () => {
  const React2 = require('react');
  return {
    __esModule: true,
    default: ({data, renderItem}: any) =>
      React2.createElement(
        require('react-native').View,
        null,
        data.map((item: any, index: number) =>
          React2.createElement(
            React2.Fragment,
            {key: index},
            renderItem({item, index}),
          ),
        ),
      ),
  };
});

function pressFirstItem(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  act(() => {
    tree!.root.findAllByType(TouchableOpacity)[0].props.onPress();
  });
}

describe('ImageSlider', () => {
  it('hands the tapped photo to onPressImage', () => {
    const onPressImage = jest.fn();
    pressFirstItem(
      <ImageSlider
        images={['http://example.test/a.jpg', 'http://example.test/b.jpg']}
        onPressImage={onPressImage}
      />,
    );

    expect(onPressImage).toHaveBeenCalledWith('http://example.test/a.jpg', 0);
  });

  it('opens a banner link instead of the viewer when the item carries one', () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockImplementation(jest.fn());
    const onPressImage = jest.fn();
    pressFirstItem(
      <ImageSlider
        images={[
          {uri: 'http://example.test/a.jpg', link: 'http://example.test'},
        ]}
        onPressImage={onPressImage}
      />,
    );

    expect(openURL).toHaveBeenCalledWith('http://example.test');
    expect(onPressImage).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  // Every string inherits a `link` method from String.prototype, so a bare
  // truthiness check on item.link mistook each url for a banner link.
  it('treats a bare url string as a photo, not as a banner link', () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockImplementation(jest.fn());
    const onPressImage = jest.fn();
    pressFirstItem(
      <ImageSlider
        images={['http://example.test/a.jpg']}
        onPressImage={onPressImage}
      />,
    );

    expect(openURL).not.toHaveBeenCalled();
    expect(onPressImage).toHaveBeenCalledWith('http://example.test/a.jpg', 0);
    openURL.mockRestore();
  });

  it('does nothing when there are no images to open', () => {
    const onPressImage = jest.fn();
    pressFirstItem(<ImageSlider images={[]} onPressImage={onPressImage} />);

    expect(onPressImage).not.toHaveBeenCalled();
  });
});
