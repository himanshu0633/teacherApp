import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

export const getTeacherContext = async () => {
  const [saved, empCode, name] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('EmpName'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
    EmpName: parsed?.EmpName || parsed?.name || parsed?.Name || name || '',
  };
};

export const rows = data => {
  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.res ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const stripHtml = value =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\\\//g, '/')
    .replace(/\s+/g, ' ')
    .trim();

const firstValue = (source, keys, fallback = '-') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return stripHtml(value);
    }
  }

  return fallback;
};

export const normalizeComplaint = item => ({
  id: firstValue(item, ['id', 'Id', 'ID'], ''),
  date: firstValue(item, ['date', 'Date', 'ComplaintDate']),
  location: firstValue(item, ['LocationName', 'location', 'Location']),
  complaintBy: firstValue(item, ['ComplaintBy', 'complaintBy', 'CreatedBy'], '-'),
  complaintTo: firstValue(item, ['EmpCode', 'EmpName', 'staff', 'ComplaintTo'], '-'),
  complaint: firstValue(item, ['description', 'Description', 'complaint']),
  resolvedDescription: firstValue(
    item,
    ['ResolveReason', 'ResolvedDescription', 'resolveReason'],
    '',
  ),
  status: firstValue(item, ['status', 'Status'], ''),
});

export const normalizeTeacher = item => ({
  id: String(item?.EmpCode || item?.empcode || item?.id || ''),
  label: stripHtml(item?.EmpName || item?.name || item?.Name || ''),
});

export const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

export const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const fetchTeachers = async empCode => {
  const payload = {
    empcode: empCode,
  };

  console.log('E-COMPLAINT TEACHERS PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.TEACHERS_LIST, payload);
  console.log('E-COMPLAINT TEACHERS RESPONSE =>', data);

  return rows(data)
    .map(normalizeTeacher)
    .filter(item => item.id && item.label);
};

export const submitComplaint = async payload => {
  console.log('E-COMPLAINT SUBMIT PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.SUBMIT_E_COMPLAINT, payload);
  console.log('E-COMPLAINT SUBMIT RESPONSE =>', data);
  return data;
};

export const fetchPendingComplaints = async empCode => {
  const payload = {
    status: 'Pending',
    EmpCode: empCode,
  };

  console.log('PENDING COMPLAINT LIST PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.PENDING_RESOLVED_COMPLAINT_LIST, payload);
  console.log('PENDING COMPLAINT LIST RESPONSE =>', data);

  return rows(data).map(normalizeComplaint);
};

export const fetchResolvedComplaints = async empCode => {
  const payload = {
    status: 'Resolve',
    staff: empCode,
  };

  console.log('RESOLVED COMPLAINT LIST PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.SHOW_E_COMPLAINT, payload);
  console.log('RESOLVED COMPLAINT LIST RESPONSE =>', data);

  return rows(data).map(normalizeComplaint);
};

export const fetchForMeComplaints = async empCode => {
  const payload = {
    status: 'Pending',
    staff: empCode,
  };

  console.log('FOR ME COMPLAINT LIST PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.SHOW_E_COMPLAINT, payload);
  console.log('FOR ME COMPLAINT LIST RESPONSE =>', data);

  return rows(data).map(normalizeComplaint);
};

export const resolveComplaint = async ({id, reason}) => {
  const payload = {
    id,
    ResolveDate: todayText(),
    ResolveReason: reason,
    status: 'Resolve',
  };

  console.log('E-COMPLAINT RESOLVE PAYLOAD =>', payload);
  const data = await postForm(API_ENDPOINTS.RESOLVED_E_COMPLAINT, payload);
  console.log('E-COMPLAINT RESOLVE RESPONSE =>', data);
  return data;
};
