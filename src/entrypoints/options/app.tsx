import { Route, Routes } from 'react-router'
import { SETTING_NAV_ITEMS } from './app-sidebar/nav-items'

export default function App() {
  return (
    <Routes>
      {Object.entries(SETTING_NAV_ITEMS).map(([key, item]) => (
        <Route key={key} path={item.url} element={<item.component />} />
      ))}
    </Routes>
  )
}
