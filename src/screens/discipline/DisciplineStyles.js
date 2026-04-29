import {StyleSheet} from 'react-native';

export const PURPLE = '#5A31C2';
export const BLUE = '#079FE3';
export const TEXT = '#202124';
export const MUTED = '#6F737B';

export const disciplineStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: PURPLE,
  },
  headerSafe: {
    backgroundColor: PURPLE,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: PURPLE,
  },
  headerButton: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chooseContent: {
    paddingHorizontal: 23,
    paddingTop: 25,
  },
  schoolName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 3,
  },
  schoolCity: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  chooseTitle: {
    color: '#0098FF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 29,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 27,
  },
  typeCard: {
    flex: 1,
    height: 120,
    borderRadius: 6,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFC326',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  typeLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '500',
  },
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 34,
  },
  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    color: TEXT,
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orText: {
    color: TEXT,
    fontSize: 9,
    textAlign: 'center',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 28,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    height: 45,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    backgroundColor: PURPLE,
  },
  resetButton: {
    backgroundColor: BLUE,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  studentCard: {
    borderWidth: 1,
    borderColor: '#B9DFF2',
    borderRadius: 7,
    backgroundColor: '#F1FBFF',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 10,
    marginBottom: 25,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
  },
  studentName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B9DFF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentCell: {
    width: '50%',
    marginBottom: 12,
  },
  studentLabel: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 4,
  },
  studentValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  submitPanel: {
    borderRadius: 6,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 15,
    paddingTop: 25,
    paddingBottom: 38,
  },
  panelInput: {
    marginBottom: 16,
  },
  submitButton: {
    height: 45,
    borderRadius: 6,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
