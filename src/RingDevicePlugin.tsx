import { FlexPlugin } from '@twilio/flex-plugin';
import * as Flex from "@twilio/flex-ui";
import { ContentFragmentProps } from '@twilio/flex-ui';
import AudioDeviceMenu from './components/AudioDeviceMenu';

const PLUGIN_NAME = 'RingDevicePlugin';

interface PluginHTMLAudioElement extends HTMLAudioElement {
  setSinkId: (id: string) => Promise<undefined>;
}

export default class RingDevicePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    const options: ContentFragmentProps = {
      sortOrder: -1,
      align: "end"
    };

    let audio = new Audio(
      'https://eggplant-dugong-3887.twil.io/assets/outbound-beep.mp3',
    ) as PluginHTMLAudioElement;

    audio.loop = true;

    flex.MainHeader.Content.add(<AudioDeviceMenu manager={manager} key="audio-device-selector" />,
      options
    );

    const resStatus = ["accepted", "canceled", "rejected", "rescinded", "timeout"];


    manager.workerClient?.on("reservationCreated", function (reservation) {
      if (reservation.task.taskChannelUniqueName === 'voice') {
        manager.voiceClient.audio?.ringtoneDevices.get().forEach(device => {
          audio.setSinkId(device.deviceId);
        });

        audio.play();
      };

      resStatus.forEach((e) => {
        reservation.on(e, () => {
          audio.pause()
        });
      });
    });


  }
}
