import React, {FC, useState, useEffect, useContext} from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import ProgressBarContext from '.';
import px from '../../utils/normalizePixel';
import {Platform} from '../../utils/platform';
import Touchable from '../../components/Touchable';
import ThemeContext from '../theme';

export let ProgressBarService: ContextValue = {
  show: null,
  hide: null,
  updateProgress: null,
};

export interface Progress {
  id?: string;
  title: string;
  value?: number;
  max?: number;
  min?: number;
  onCancel?(): void;
}

export interface ContextValue {
  show(progress: Progress): string;
  hide(id: string): void;
  updateProgress(id: string, value: number): void;
}

const ProgressBarProvider: FC = ({children}) => {
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const {theme} = useContext(ThemeContext);

  const show: ContextValue['show'] = (progress: Progress) => {
    if (!progress.min) progress.min = 0;
    if (!progress.max) progress.max = 100;
    if (!progress.value) progress.value = 0;
    if (!progress.id) {
      progress.id = Math.random().toString();
    }

    setProgressList([...progressList, progress]);
    return progress.id;
  };

  const hide: ContextValue['hide'] = (id: string) => {
    setProgressList(progressList.filter(p => p.id !== id));
  };

  const updateProgress = (id: string, value: number) => {
    console.log('TCL: updateProgress -> id', id);
    console.log('value', value);
    console.log('TCL: updateProgress -> progressList', progressList);
    const newList = progressList.map(p => {
      if (p.id === id) return {...p, value};
      return p;
    });
    console.log('TCL: updateProgress -> newList', newList);
    setProgressList(newList);
  };

  const renderCancelButton = (progress: Progress) => (
    <Touchable
      onPress={() => {
        progress.onCancel && progress.onCancel();
        hide(progress.id);
      }}
      style={styles.cancelButton}>
      <Text style={styles.cancelButtonTitle}>Cancel</Text>
    </Touchable>
  );

  const renderProgressBar = (progress: Progress) => {
    const width = Dimensions.get('window').width * (2 / 3);
    const indicatorWidth = (progress.value / progress.max) * width;

    return (
      <View style={[styles.progressBarContainer, {width}]}>
        <View style={[styles.progressIndicator, {width: indicatorWidth}]} />
        <View style={{flex: 1}}>
          <Text style={styles.progressTitle} numberOfLines={1}>
            {progress.title}
          </Text>
        </View>

        {renderCancelButton(progress)}
      </View>
    );
  };

  const value: ContextValue = {show, hide, updateProgress};
  useEffect(() => {
    ProgressBarService = value;
  }, [value]);

  return (
    <ProgressBarContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {progressList.map(renderProgressBar)}
      </View>
    </ProgressBarContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: px(60),
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 'auto',
    backgroundColor: '#492146',
    paddingVertical: px(3),
    paddingHorizontal: px(7.5),
    borderRadius: px(5),
    borderColor: '#fff',
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: px(5),
    elevation: 5,
    ...(Platform.isWeb && {boxShadow: '1px 0px 15px 3px rgba(0,0,0,0.23)'}),
  },
  progressTitle: {
    fontSize: px(13.5),
    color: '#fff',
  },
  progressIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#26AD76',
    borderRadius: px(5),
  },
  cancelButton: {
    marginLeft: 'auto',
  },
  cancelButtonTitle: {
    fontWeight: 'bold',
    color: '#ffff',
    fontSize: px(13),
  },
});

export default ProgressBarProvider;
