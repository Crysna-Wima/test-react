import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/master/api/area/';

// Configure axios with default settings for CORS
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
});

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
};

// Add request interceptor to include CSRF token in headers
apiClient.interceptors.request.use(
  config => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Explicitly export the Area interface so it can be imported elsewhere
export interface Area {
  base64pk: string;
  area_id: string;
  area_name: string;
  status: string;
  enable: boolean;
  is_removed: boolean;
  description: string;
  properties: Record<string, any>;
  created: {
    date: string;
    datetime: string;
    datetimezone: string;
    time: string;
    utc: string;
    zone: string;
  };
  modified: {
    date: string;
    datetime: string;
    datetimezone: string;
    time: string;
    utc: string;
    zone: string;
  };
}

export interface AreaResponse {
  totalCount: number;
  data: Area[];
}

// Form data interface for creating/updating areas
export interface AreaFormData {
  area_id: string;
  area_name: string;
  status: string;
  enable: boolean;
  description: string;
}

// Retrieve areas with pagination, sorting, and filtering
export const getAreas = async (
  page = 1, 
  pageSize = 10, 
  sortField = 'area_id', 
  sortOrder = 'asc',
  filters = {}
) => {
  const params = {
    page,
    pageSize,
    sortField,
    sortOrder,
    ...filters
  };
  
  const response = await apiClient.get<AreaResponse>('', { params });
  return response.data;
};

// Get single area
export const getArea = async (id: string) => {
  const response = await apiClient.get<Area>(`${id}/`);
  return response.data;
};

// Create new area
export const createArea = async (data: AreaFormData) => {
  // Convert description to JSON string if it's not already a string
  const formattedData = {
    ...data,
    description: typeof data.description === 'string' 
      ? data.description 
      : JSON.stringify(data.description || {}),
    // Add any other formatting required by your API
  };
  
  const response = await apiClient.post<Area>('', formattedData);
  return response.data;
};

// Update area
export const updateArea = async (id: string, data: AreaFormData) => {
  // Convert description to JSON string if it's not already a string
  const formattedData = {
    ...data,
    description: typeof data.description === 'string' 
      ? data.description 
      : JSON.stringify(data.description || {}),
    // Add any other formatting required by your API
  };
  
  const response = await apiClient.put<Area>(`${id}/`, formattedData);
  return response.data;
};

// Delete area
export const deleteArea = async (id: string) => {
  const response = await apiClient.delete(`${id}/`);
  return response.data;
};