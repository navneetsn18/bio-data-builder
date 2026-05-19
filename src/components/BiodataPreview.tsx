import { forwardRef } from "react";
import corner from "@/assets/floral-corner.png";
import border from "@/assets/floral-border.png";

export type Field = { id: string; label: string; value: string };
export type Section = { id: string; title: string; fields: Field[] };

type Props = {
  sections: Section[];
  photo: string | null;
  heading: string;
};

export const BiodataPreview = forwardRef<HTMLDivElement, Props>(
  ({ sections, photo, heading }, ref) => {
    return (
      <div
        ref={ref}
        className="biodata-page"
        style={{
          width: "794px",
          minHeight: "1123px",
          background: "var(--biodata-bg)",
          position: "relative",
          padding: "120px 60px 120px",
          fontFamily: "'Inter', sans-serif",
          color: "var(--biodata-text)",
          boxSizing: "border-box",
        }}
      >
        {/* Corner ornaments */}
        <img src={corner} alt="" className="corner top-left" />
        <img src={corner} alt="" className="corner top-right" />
        <img src={corner} alt="" className="corner bottom-left" />
        <img src={corner} alt="" className="corner bottom-right" />

        {/* Top border */}
        <img src={border} alt="" className="hborder top" />

        {/* Heading */}
        <div
          style={{
            textAlign: "center",
            color: "var(--biodata-heading)",
            fontFamily: "'Tiro Devanagari Sanskrit', serif",
            fontSize: "32px",
            marginBottom: "32px",
            marginTop: "-40px",
          }}
        >
          {heading}
        </div>

        {photo && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src={photo}
              alt="Profile"
              style={{
                width: "160px",
                height: "200px",
                objectFit: "cover",
                border: "4px solid var(--biodata-section)",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {sections.map((section) => (
          <div key={section.id} style={{ marginBottom: "28px" }}>
            <div
              style={{
                background: "var(--biodata-section)",
                color: "var(--biodata-text)",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.08em",
                padding: "10px 16px",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </div>
            <div style={{ padding: "16px 16px 0 16px" }}>
              {section.fields.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    fontSize: "14px",
                    padding: "6px 0",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--biodata-label)" }}>
                    {f.label} :
                  </div>
                  <div>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom border */}
        <img src={border} alt="" className="hborder bottom" />
      </div>
    );
  }
);

BiodataPreview.displayName = "BiodataPreview";
