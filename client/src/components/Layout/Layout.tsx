import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import styles from './Layout.module.css';

export function Layout() {
	return (
		<div className={styles.layout}>
			<Header />
			<main className='container' style={{ paddingTop: '1.25rem' }}>
				<Outlet />
			</main>
		</div>
	);
}
