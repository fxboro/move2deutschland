import React, { useState } from "react";
import {
  TestimonialItem,
  toggleTestimonialApproval,
  deleteTestimonial,
  createTestimonial,
} from "../../services/adminService";
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  MapPin,
  GraduationCap,
  Quote,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "../Toast";

interface TestimonialsTabProps {
  testimonials: TestimonialItem[];
  userRole: string;
}

export default function TestimonialsTab({ testimonials, userRole }: TestimonialsTabProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [fromLocation, setFromLocation] = useState("Lagos, Nigeria");
  const [toLocation, setToLocation] = useState("Munich, Germany");
  const [university, setUniversity] = useState("Technical University of Munich (TUM)");
  const [programme, setProgramme] = useState("M.Sc. Data Engineering");
  const [quote, setQuote] = useState("");
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
  );
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleToggle = async (item: TestimonialItem) => {
    try {
      await toggleTestimonialApproval(item.id, item.approved);
      toast.success(
        item.approved
          ? `Hidden ${item.name}'s story from public view`
          : `Published ${item.name}'s story live!`
      );
    } catch (e: any) {
      toast.error(`Failed to toggle approval: ${e.message}`);
    }
  };

  const handleDelete = async (id: string, authorName: string) => {
    if (!window.confirm(`Permanently delete testimonial from ${authorName}?`)) return;
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted.");
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quote) {
      toast.warning("Please provide candidate name and testimonial quote.");
      return;
    }
    setSubmitting(true);
    try {
      await createTestimonial({
        name,
        fromLocation,
        toLocation,
        university,
        programme,
        quote,
        photoUrl,
        approved: true,
      });
      toast.success("Success story added and published!");
      setCreateModalOpen(false);
      setName("");
      setQuote("");
    } catch (e: any) {
      toast.error(`Failed to create testimonial: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Student Success Stories ({testimonials.length})
          </h2>
          <p className="text-xs text-slate-500">
            Moderate and approve candidate testimonials appearing on the public landing page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#003153] text-[#FFCC00] hover:bg-[#002540] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Story</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Quote className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No testimonials found.</p>
          </div>
        ) : (
          testimonials.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                item.approved
                  ? "border-emerald-200 dark:border-emerald-900/40"
                  : "border-slate-200 dark:border-slate-800 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={item.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FFCC00]"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{item.fromLocation} → {item.toLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-semibold text-[#003153] dark:text-[#FFCC00] mb-2">
                  <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.university}</span>
                </div>
                <div className="text-[11px] text-slate-500 mb-3">{item.programme}</div>

                <div className="relative p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
                  <Quote className="w-3 h-3 absolute top-2 right-2 text-slate-300 dark:text-slate-600" />
                  "{item.quote}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span
                  className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    item.approved
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {item.approved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live on Site</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>Hidden</span>
                    </>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={item.approved ? "Hide from public" : "Publish to site"}
                  >
                    {item.approved ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                  </button>

                  {userRole === "super_admin" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Student Success Story
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Adebayo"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Origin City
                </label>
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="e.g. Abuja, Nigeria"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Destination City
                </label>
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="e.g. Berlin, Germany"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Placed University
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. RWTH Aachen"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Degree Programme
              </label>
              <input
                type="text"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                placeholder="e.g. M.Sc. Renewable Energy"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Student Quote *
              </label>
              <textarea
                required
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Move2Deutschland handled my German grade conversion and university application perfectly..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Photo URL
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003153] text-[#FFCC00] hover:bg-[#002540]"
              >
                {submitting ? "Publishing..." : "Add & Publish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
