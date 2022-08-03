import { Box, Menu, MenuButton, MenuGroup, MenuItem, Text, useMenuState } from '@twilio-paste/core';
import { Theme } from '@twilio-paste/core/theme';
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import * as Flex from "@twilio/flex-ui";
import { DynamicContentStore } from "@twilio/flex-ui";
import { useCallback, useEffect, useState } from 'react';

export const displayName = "AudioDeviceMenu";
export const contentStore = new DynamicContentStore(displayName);

const AudioDeviceMenu = ({ manager }: { manager: Flex.Manager }) => {

  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>();

  const menu = useMenuState();

  const updateDeviceList = useCallback(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(foundDevices => {
        setDeviceList(foundDevices.filter(item => item.kind === "audiooutput"))
      });
  }, [])


  useEffect(() => {

    // init the device list
    updateDeviceList();

    // add listener for device list changes
    navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);

    manager.voiceClient?.audio?.ringtoneDevices.set('default');
    setSelectedDevice('default');

    return () => {
      // unsubscribre the listener when the component unmount
      navigator.mediaDevices.removeEventListener('devicechange', updateDeviceList);
    }

  }, []);

  const selectDeviceHandler = useCallback((selectedDevice: MediaDeviceInfo) => {

    manager.voiceClient?.audio?.ringtoneDevices.set(selectedDevice.deviceId).then(() => {
      menu.hide();
      setSelectedDevice(selectedDevice.deviceId);
    });

  }, []);

  return (
    <Theme.Provider theme="default">
      <Box marginRight="space50" height="100%" display="flex" alignItems="center" >
        <MenuButton {...menu} variant="secondary" size="small">
          Ringing Device <ChevronDownIcon decorative />
        </MenuButton>
      </Box>

      <Menu {...menu} aria-label="Preferences">
        <MenuGroup label="Select a Device">
          {
            deviceList.length === 0 ? (<MenuItem {...menu} disabled>No Device</MenuItem>) : deviceList.map((deviceItem, index) => {
              return (
                <MenuItem onClick={() => { selectDeviceHandler(deviceItem) }} key={index} {...menu}>
                  <Text as="span" fontWeight={(deviceItem.deviceId === selectedDevice) ? "fontWeightBold" : "fontWeightNormal"} >{`${deviceItem.label}`}</Text>
                </MenuItem>
              )
            })

          }
        </MenuGroup>
      </Menu>
    </Theme.Provider>
  )

}


export default AudioDeviceMenu;