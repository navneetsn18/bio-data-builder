import { forwardRef } from "react";
import corner from "@/assets/floral-corner.png";
import border from "@/assets/floral-border.png";
import ganeshay from "@/assets/ganeshay-namah.png";

export type Field = { id: string; label: string; value: string };
export type Section = { id: string; title: string; fields: Field[] };

type Props = {
  sections: Section[];
  photo: string | null;
};

export const BiodataPreview = forwardRef<HTMLDivElement, Props>(
  ({ sections, photo }, ref) => {
    return (
      <div
        ref={ref}
        className="biodata-page"
        style={{
          width: "794px",
          minHeight: "1123px",
          background: "var(--biodata-bg)",
          position: "relative",
          padding: "140px 56px 120px",
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--biodata-text)",
          boxSizing: "border-box",
        }}
      >
        <img src={corner} alt="" className="corner top-left" />
        <img src={corner} alt="" className="corner top-right" />
        <img src={corner} alt="" className="corner bottom-left" />
        <img src={corner} alt="" className="corner bottom-right" />

        <img src={border} alt="" className="hborder top" />

        <div style={{ textAlign: "center", marginBottom: "28px", marginTop: "-30px" }}>
          <img
            src={ganeshay}
            alt="Shri Ganeshay Namah"
            style={{ height: "70px", width: "auto", display: "block", margin: "0 auto" }}
          />
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
                fontWeight: 900,
                fontSize: "14px",
                letterSpacing: "0.1em",
                padding: "10px 18px",
                textTransform: "uppercase",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {section.title}
            </div>
            <div style={{ padding: "14px 18px 0 18px" }}>
              {section.fields.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "max-content 1fr",
                    columnGap: "8px",
                    fontSize: "16px",
                    padding: "3px 0",
                    lineHeight: 1.1,
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#0b1220", fontSize: "16px" }}>
                    {f.label} :
                  </div>
                  <div>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <img src={border} alt="" className="hborder bottom" />
      </div>
    );
  }
);

BiodataPreview.displayName = "BiodataPreview";
