import axios from 'axios';
import { Platform } from 'react-native';

let baseURL = 'http://192.168.0.104:5001/api'; // your machine's LAN IP

export const api = axios.create({
  baseURL,
  timeout: 5000,
});
