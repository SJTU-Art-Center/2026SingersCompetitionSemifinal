import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // 生产环境可开启 StrictMode，但开发环境中为了 Socket.IO 调试方便可关闭
  <App />
)
