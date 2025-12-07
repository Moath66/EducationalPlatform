import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";
import "../../styles/StudyPlans.css";

export default function StudyPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [typeFilter, setTypeFilter] = useState("all"); // all | plan | schedule
  const [gradeFilter, setGradeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // upload form
  const [form, setForm] = useState({
    title: "",
    type: "plan", // plan | schedule
    grade: "",
    description: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  // preview
  const [previewItem, setPreviewItem] = useState(null);

  // ✅ Proxy URL (حل 401 في Cloudinary)
  const fileOpenUrl = (it) => `/api/study-files/${it._id}/download`;

  const isImage = (it) => String(it?.fileType || "").startsWith("image/");
  const isPdf = (it) =>
    String(it?.fileType || "").includes("pdf") ||
    String(it?.fileUrl || "").toLowerCase().includes(".pdf");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/study-files");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log(e);
      alert("❌ فشل في تحميل الخطط والجداول");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((it) => {
      const matchesType = typeFilter === "all" ? true : it.type === typeFilter;

      const matchesGrade =
        gradeFilter === "all" ? true : String(it.grade) === String(gradeFilter);

      const matchesSearch =
        !q ||
        String(it.title || "").toLowerCase().includes(q) ||
        String(it.description || "").toLowerCase().includes(q) ||
        String(it.fileName || "").toLowerCase().includes(q);

      return matchesType && matchesGrade && matchesSearch;
    });
  }, [items, typeFilter, gradeFilter, search]);

  const grades = useMemo(() => {
    const set = new Set(items.map((x) => x.grade).filter(Boolean));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [items]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed =
      f.type === "application/pdf" ||
      f.type.startsWith("image/") ||
      f.name.toLowerCase().endsWith(".pdf");

    if (!allowed) {
      alert("⚠ مسموح فقط PDF أو صور (PNG/JPG/WEBP)");
      e.target.value = "";
      return;
    }

    setForm((p) => ({ ...p, file: f }));
  };

  const removePickedFile = () => {
    setForm((p) => ({ ...p, file: null }));
    const input = document.getElementById("sp-file");
    if (input) input.value = "";
  };

  const handleUpload = async () => {
    try {
      // ✅ لو تبي grade اختياري احذف form.grade من الشرط
      if (!form.title || !form.type || !form.grade || !form.file) {
        alert("⚠ اكتب العنوان، اختر النوع، الصف/المرحلة، وارفع ملف.");
        return;
      }

      setUploading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("type", form.type);
      fd.append("grade", form.grade);
      if (form.description) fd.append("description", form.description);
      fd.append("file", form.file);

      // ✅ لا تضع Content-Type يدوي
      await apiClient.post("/api/study-files", fd);

      alert("✔ تم رفع الملف بنجاح");
      setForm({
        title: "",
        type: "plan",
        grade: "",
        description: "",
        file: null,
      });
      removePickedFile();
      fetchItems();
    } catch (e) {
      console.log(e.response?.data || e);
      alert(e.response?.data?.message || "❌ فشل في رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("❗ هل تريد حذف هذا الملف؟")) return;
    try {
      await apiClient.delete(`/api/study-files/${id}`);
      alert("🗑️ تم حذف الملف");
      fetchItems();
    } catch (e) {
      console.log(e.response?.data || e);
      alert(e.response?.data?.message || "❌ فشل في حذف الملف");
    }
  };

  const badgeLabel = (t) => (t === "plan" ? "خطة" : "جدول");
  const typeLabel = (t) => (t === "plan" ? "خطة دراسية" : "جدول دراسي");

  return (
    <AdminLayout>
      <div className="sp-head">
        <div>
          <h2 className="sp-title">الخطط والجداول الدراسية</h2>
          <p className="sp-subtitle">
            رفع ملفات PDF/صور حسب المرحلة، مع عرض ومعاينة وحذف.
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="sp-card">
        <div className="sp-cardHeader">
          <h3 className="sp-cardTitle">رفع ملف جديد</h3>
          <p className="sp-cardHint">الملفات المسموحة: PDF أو صور (PNG/JPG)</p>
        </div>

        <div className="sp-form">
          <div className="sp-grid">
            <label className="sp-field">
              <span className="sp-label">العنوان</span>
              <input
                className="sp-input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="مثال: خطة الفصل الأول - الصف 10"
              />
            </label>

            <label className="sp-field">
              <span className="sp-label">النوع</span>
              <select
                className="sp-input"
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
              >
                <option value="plan">خطة</option>
                <option value="schedule">جدول</option>
              </select>
            </label>

            <label className="sp-field">
              <span className="sp-label">الصف / المرحلة</span>
              <input
                className="sp-input"
                value={form.grade}
                onChange={(e) =>
                  setForm((p) => ({ ...p, grade: e.target.value }))
                }
                placeholder="مثال: 10 أو 1 أو Grade 10"
              />
            </label>

            <label className="sp-field sp-span2">
              <span className="sp-label">وصف (اختياري)</span>
              <input
                className="sp-input"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="معلومة إضافية عن الملف..."
              />
            </label>
          </div>

          <div className="sp-fileRow">
            <label className="sp-filePick" htmlFor="sp-file">
              <input id="sp-file" type="file" onChange={onPickFile} hidden />
              <span>📎 اختر ملف</span>
            </label>

            <div className="sp-fileInfo">
              {form.file ? (
                <>
                  <span className="sp-fileName">{form.file.name}</span>
                  <button
                    type="button"
                    className="sp-linkBtn"
                    onClick={removePickedFile}
                  >
                    إزالة
                  </button>
                </>
              ) : (
                <span className="sp-fileEmpty">لم يتم اختيار ملف بعد</span>
              )}
            </div>

            <button
              type="button"
              className="sp-primaryBtn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "جاري الرفع..." : "رفع"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sp-filters">
        <input
          className="sp-search"
          placeholder="ابحث في العنوان أو الوصف أو اسم الملف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="sp-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">كل الأنواع</option>
          <option value="plan">خطط</option>
          <option value="schedule">جداول</option>
        </select>

        <select
          className="sp-select"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="all">كل المراحل</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="sp-listCard">
        <div className="sp-listHeader">
          <h3 className="sp-listTitle">الملفات المرفوعة</h3>
          <span className="sp-count">({filtered.length})</span>
        </div>

        {loading ? (
          <div className="sp-empty">🔄 جاري تحميل البيانات...</div>
        ) : filtered.length === 0 ? (
          <div className="sp-empty sp-emptyMuted">لا توجد ملفات مطابقة.</div>
        ) : (
          <div className="sp-tableWrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>النوع</th>
                  <th>المرحلة</th>
                  <th>الملف</th>
                  <th className="sp-thActions">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it._id}>
                    <td className="sp-tdTitle">
                      <div className="sp-titleRow">
                        <span className="sp-titleText">{it.title}</span>
                        <span className="sp-badge">{badgeLabel(it.type)}</span>
                      </div>
                      {it.description ? (
                        <div className="sp-desc">{it.description}</div>
                      ) : null}
                    </td>

                    <td>{typeLabel(it.type)}</td>
                    <td>{it.grade || "-"}</td>

                    <td className="sp-fileCell">
                      {/* ✅ استخدم Proxy بدل fileUrl */}
                      <a
                        className="sp-fileLink"
                        href={fileOpenUrl(it)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {it.fileName || "فتح"}
                      </a>
                    </td>

                    <td className="sp-actionsCell">
                      <div className="sp-actions">
                        <button
                          type="button"
                          className="sp-btn sp-btnView"
                          onClick={() => setPreviewItem(it)}
                        >
                          معاينة
                        </button>
                        <button
                          type="button"
                          className="sp-btn sp-btnDelete"
                          onClick={() => handleDelete(it._id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="sp-modalOverlay" onClick={() => setPreviewItem(null)}>
          <div className="sp-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modalHeader">
              <div>
                <h4 className="sp-modalTitle">{previewItem.title}</h4>
                <p className="sp-modalMeta">
                  {typeLabel(previewItem.type)} • {previewItem.grade || "-"}
                </p>
              </div>
              <button
                type="button"
                className="sp-x"
                onClick={() => setPreviewItem(null)}
              >
                ×
              </button>
            </div>

            <div className="sp-modalBody">
              {isImage(previewItem) ? (
                <img
                  className="sp-previewImg"
                  src={fileOpenUrl(previewItem)}
                  alt=""
                />
              ) : isPdf(previewItem) ? (
                <iframe
                  className="sp-previewFrame"
                  src={fileOpenUrl(previewItem)}
                  title="preview"
                />
              ) : (
                <div style={{ padding: 16 }}>
                  <a
                    className="sp-primaryLink"
                    href={fileOpenUrl(previewItem)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    فتح الملف
                  </a>
                </div>
              )}
            </div>

            <div className="sp-modalFooter">
              <a
                className="sp-primaryLink"
                href={fileOpenUrl(previewItem)}
                target="_blank"
                rel="noreferrer"
              >
                فتح في تبويب جديد
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
