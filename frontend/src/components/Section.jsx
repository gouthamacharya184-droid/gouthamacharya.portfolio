import { motion } from "framer-motion";
import { fadeUp } from "../utils/motion";

export default function Section({ id, eyebrow, title, description, children, className = "" }) {
  return (
    <section id={id} className={`relative py-14 sm:py-20 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-[75rem] px-4 xxs:px-4 xs:px-6 sm:px-8 md:px-10 xl:px-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-8 xs:mb-10 sm:mb-12 lg:mb-16 max-w-3xl"
        >
          <span className="mb-3 xs:mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/5 px-3 xs:px-4 py-1 xs:py-1.5 text-[9px] xs:text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
            {eyebrow}
          </span>
          <h2
            className="mt-2 xs:mt-3 font-bold tracking-tight text-white leading-tight"
            style={{ fontSize: "var(--text-h2)" }}
          >
            {title}
          </h2>
          {description ? (
            <p
              className="mt-3 xs:mt-4 leading-relaxed text-slate-400 max-w-2xl"
              style={{ fontSize: "var(--text-body-lg)" }}
            >
              {description}
            </p>
          ) : null}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
