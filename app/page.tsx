'use client';
import dynamic from 'next/dynamic';
// The app runs entirely in the browser (it uses today's date and your login).
const App = dynamic(() => import('@/components/App'), { ssr: false });
export default function Page() { return <App />; }
