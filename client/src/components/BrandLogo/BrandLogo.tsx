import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";
import styles from "./BrandLogo.module.css";

export function BrandLogo() {
  return (
    <Link to="/" className={styles.link}>
      <img src={logo} alt="ВкусДом" className={styles.logo} />
    </Link>
  );
}
