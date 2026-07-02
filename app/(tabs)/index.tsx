import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import * as Contacts from 'expo-contacts';
import * as Battery from 'expo-battery';
import { Linking } from 'react-native';
import { useEffect, useState } from 'react';

export default function Home() {
  const [text, setText] = useState('Haan Jashbeer bolo 💖');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    return () => { Voice.destroy().then(Voice.removeAllListeners); };
  }, []);

  const speak = (msg: string) => {
    setText(msg);
    Speech.speak(msg, { language: 'hi-IN' });
  };

  const start = async () => {
    try {
      setIsListening(true);
      await Voice.start('hi-IN');
    } catch (e) { speak('Mic error'); }
  };

  const onSpeechResults = (e: any) => {
    const cmd = e.value[0].toLowerCase();
    setText(cmd);
    handleCmd(cmd);
    setIsListening(false);
  };

  const handleCmd = async (cmd: string) => {
    if (cmd.includes('hey jiya')) {
      speak('Haan Jashbeer bolo');
      setTimeout(start, 1500);
    }
    else if (cmd.includes('call')) {
      const name = cmd.replace('ko call karo', '').replace('call', '').trim();
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({ name });
        if (data[0]?.phoneNumbers) {
          speak(`${name} ko call laga rahi hu`);
          Linking.openURL(`tel:${data[0].phoneNumbers[0].number}`);
        } else speak(`${name} nahi mila`);
      }
    }
    else if (cmd.includes('battery')) {
      const level = await Battery.getBatteryLevelAsync();
      speak(`Battery ${Math.round(level * 100)} percent hai`);
    }
    else if (cmd.includes('youtube')) {
      speak('YouTube khol rahi hu');
      Linking.openURL('vnd.youtube://');
    }
    else if (cmd.includes('whatsapp')) {
      speak('WhatsApp khol rahi hu');
      Linking.openURL('whatsapp://send');
    }
    else if (cmd.includes('time') || cmd.includes('baja')) {
      const time = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
      speak(`Abhi ${time} baj rahe hai`);
    }
    else speak('Samajh nahi aaya Jashbeer');
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Jiya v2.0 💖</Text>
      <View style={s.box}><Text style={s.text}>{text}</Text></View>
      <TouchableOpacity style={[s.btn, isListening && s.btnActive]} onPress={start}>
        <Text style={s.btnText}>{isListening? '🔴 Sun rahi hu...' : '🎤 Tap Karke Bolo'}</Text>
      </TouchableOpacity>
      <Text style={s.hint}>Bol: "Hey Jiya" ya "Rahul ko call karo"</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fce4ec', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e91e63', marginBottom: 20 },
  box: { backgroundColor: 'white', padding: 20, borderRadius: 15, width: '100%', minHeight: 100, marginBottom: 30 },
  text: { fontSize: 18, textAlign: 'center' },
  btn: { backgroundColor: '#e91e63', padding: 20, borderRadius: 30, width: '80%' },
  btnActive: { backgroundColor: '#c2185b' },
  btnText: { color: 'white', fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  hint: { marginTop: 20, color: '#666', fontSize: 12 }
});
