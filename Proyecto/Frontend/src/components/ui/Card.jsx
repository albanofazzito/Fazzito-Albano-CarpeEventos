import { useId } from "react";
import { cx } from "../../utils/classNames.js";
import styles from "./Card.module.css";

/** Panel blanco con título opcional; agrupa la información en las pantallas internas. */
export default function Card({ title, headingLevel = 2, actions, className, children }) {
  const titleId = useId();
  const Heading = `h${headingLevel}`;

  return (
    <section className={cx(styles.card, className)} aria-labelledby={title ? titleId : undefined}>
      {title && (
        <header className={styles.header}>
          <Heading id={titleId} className={styles.title}>
            {title}
          </Heading>
          {actions}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
