import { NavLink, useNavigate } from 'react-router-dom';
import { clearCredentials } from '../../api/auth';
import logo from '../../assets/Logo.png';
import styles from './Header.module.css';

export function Header() {
	const navigate = useNavigate();

	function handleLogout() {
		clearCredentials();
		navigate('/login');
	}

	function navLinkClassName({ isActive }: { isActive: boolean }) {
		return isActive ? styles.navLinkActive : undefined;
	}

	return (
		<header className={styles.header}>
			<div className={`container ${styles.inner}`}>
				<img src={logo} alt='ВкусДом' className={styles.logo} />
				<nav className={styles.nav}>
					<NavLink to='/admin' end className={navLinkClassName}>
						Админ панель
					</NavLink>
					<NavLink to='/' end className={navLinkClassName}>
						Сотрудники
					</NavLink>
					<NavLink to='/admin/rating' className={navLinkClassName}>
						Рейтинг
					</NavLink>
					<NavLink to='/admin/comments' className={navLinkClassName}>
						Комментарии
					</NavLink>
				</nav>
				<button
					type='button'
					className={`btn btn-primary ${styles.logout}`}
					onClick={handleLogout}
				>
					Выйти
				</button>
			</div>
		</header>
	);
}
