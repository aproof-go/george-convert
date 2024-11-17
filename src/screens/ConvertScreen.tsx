import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const ConvertScreen = ({ route }) => {
  const { files } = route.params;
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({});

  const handleConvert = async () => {
    setConverting(true);
    
    try {
      for (const file of files) {
        // 实现文件转换逻辑
        await convertFile(file);
      }
      
      Alert.alert('成功', '文件转换完成');
    } catch (error) {
      Alert.alert('错误', '转换失败，请重试');
    } finally {
      setConverting(false);
    }
  };

  const convertFile = async (file) => {
    // 实现单个文件转换逻辑
    // 这里需要调用你的转换服务
  };

  const renderItem = ({ item }) => (
    <View style={styles.fileItem}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.fileSize}>
        {(item.size / 1024 / 1024).toFixed(2)} MB
      </Text>
      {progress[item.name] && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress[item.name]}%` }
            ]} 
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        style={styles.list}
      />
      <TouchableOpacity
        style={[
          styles.convertButton,
          converting && styles.convertButtonDisabled
        ]}
        onPress={handleConvert}
        disabled={converting}
      >
        <Text style={styles.convertButtonText}>
          {converting ? '转换中...' : '开始转换'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... 样式定义
});

export default ConvertScreen;
