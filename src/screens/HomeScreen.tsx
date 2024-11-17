import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

export const HomeScreen = ({ navigation }) => {
  const handleSelectFiles = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.plainText,
          // 添加其他支持的文件类型
        ],
        allowMultiSelection: true,
      });

      if (results.length > 0) {
        navigation.navigate('Convert', { files: results });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('文件选择错误:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>电子书格式转换</Text>
        
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleSelectFiles}
        >
          <Text style={styles.buttonText}>选择文件</Text>
        </TouchableOpacity>

        <Text style={styles.supportText}>
          支持 EPUB、MOBI、AZW3、PDF、TXT 等格式
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1a1a1a',
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
