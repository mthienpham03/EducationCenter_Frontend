"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { courseService } from "@/lib/api/service";

// Circular progress component
function CircularProgress({ value, size = 120, strokeWidth = 10, label, sublabel }: { value: number; size?: number; strokeWidth?: number; label: string; sublabel: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container-high)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="var(--color-primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">{Math.round(animatedValue)}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-on-surface mt-2 text-center max-w-[150px] truncate">{label}</p>
      <p className="text-xs text-on-surface-variant text-center">{sublabel}</p>
    </div>
  );
}

// Bar chart for weekly activity
function WeeklyBarChart({ data }: { data: { day: string; hours: number }[] }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  return (
    <div className="flex items-end gap-3 h-40 px-2">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-on-surface">{d.hours}h</span>
          <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-container transition-all duration-700 ease-out"
            style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: d.hours > 0 ? "8px" : "2px" }}
          />
          <span className="text-xs text-on-surface-variant font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

const WEEKLY_DATA = [
  { day: "T2", hours: 3 },
  { day: "T3", hours: 5 },
  { day: "T4", hours: 2 },
  { day: "T5", hours: 4 },
  { day: "T6", hours: 6 },
  { day: "T7", hours: 1 },
  { day: "CN", hours: 3 },
];

const BADGES = [
  { name: "Hoàn thành chương đầu", icon: "stars", color: "text-amber-500", bg: "bg-amber-50", date: "01/06/2026" },
  { name: "Học 7 ngày liên tiếp", icon: "local_fire_department", color: "text-orange-500", bg: "bg-orange-50", date: "07/06/2026" },
  { name: "Điểm trung bình > 8.0", icon: "military_tech", color: "text-blue-600", bg: "bg-blue-50", date: "15/06/2026" },
  { name: "Hoàn thành 50% khóa học", icon: "emoji_events", color: "text-purple-600", bg: "bg-purple-50", date: "20/06/2026" },
];

const RECENT_ACTIVITIES = [
  { title: "Hoàn thành bài học 6.2: Animation Principles", course: "UI/UX Advanced", time: "Hôm nay, 14:30", icon: "check_circle", color: "text-tertiary" },
  { title: "Nộp bài kiểm tra Chương 6", course: "UI/UX Advanced", time: "Hôm nay, 13:00", icon: "quiz", color: "text-primary" },
  { title: "Xem bài học 3.4: API Routes", course: "Fullstack Web Dev", time: "Hôm qua, 20:15", icon: "play_circle", color: "text-secondary" },
  { title: "Tải tài liệu React Hooks Deep Dive.pdf", course: "Fullstack Web Dev", time: "Hôm qua, 19:30", icon: "download", color: "text-tertiary" },
  { title: "Hoàn thành bài học 3.3: Database Queries", course: "Fullstack Web Dev", time: "26/06/2026, 16:45", icon: "check_circle", color: "text-tertiary" },
];

export default function StudentProgressPage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourses();
        const coursesList = res.success && res.data && res.data.length > 0 ? res.data : [];
        const coursesWithProgress = await Promise.all(
          coursesList.map(async (course: any, index: number) => {
              let totalLessonsCount = 12; // default fallback
              let completedLessonsCount = 0;
              try {
                const completedKey = `completed_lessons_${user?.id}_${course.id}`;
                const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");
                completedLessonsCount = completed.length;

                const curriculumRes = await courseService.getChaptersAndLessons(course.id);
                if (curriculumRes.success && curriculumRes.data) {
                  const allLessons = curriculumRes.data.flatMap((ch: any) => ch.lessons || []);
                  totalLessonsCount = allLessons.length || 12;
                }
              } catch (e) {
                console.error("Lỗi khi tải chương học của khóa:", course.id, e);
              }

              const colors = [
                "from-blue-500 to-indigo-500",
                "from-emerald-500 to-teal-500",
                "from-orange-500 to-amber-500",
                "from-purple-500 to-pink-500",
              ];
              const color = colors[index % colors.length];
              const progress = totalLessonsCount > 0 ? Math.min(Math.round((completedLessonsCount / totalLessonsCount) * 100), 100) : 0;

              return {
                id: course.id,
                name: course.name,
                code: course.code,
                lecturer: "Giảng viên EduCenter",
                progress,
                completedChapters: completedLessonsCount,
                totalChapters: totalLessonsCount,
                avgScore: progress > 50 ? 8.5 : progress > 0 ? 7.2 : 0,
                totalHours: completedLessonsCount * 2, // assume 2 hours per completed lesson
                color,
              };
            })
          );
          setCourses(coursesWithProgress);
      } catch (err) {
        console.error("Lỗi khi tải tiến độ khóa học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [mounted, user?.id]);

  const overallProgress = courses.length > 0 ? Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length) : 0;
  const totalHours = courses.reduce((a, c) => a + c.totalHours, 0);
  const completedLessons = courses.reduce((a, c) => a + c.completedChapters, 0);
  const totalLessons = courses.reduce((a, c) => a + c.totalChapters, 0);

  if (!mounted) return null;

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
      {/* Sidebar */}
      <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
          <p className="text-label-md font-label-md text-on-surface-variant">Cổng học viên</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">school</span><span>Quản lý khóa học</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">folder_open</span><span>Tài liệu</span>
          </Link>
          <Link href="/student/courses/quizzes" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">quiz</span><span>Bài kiểm tra</span>
          </Link>
          <Link href="/student/schedules" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">calendar_month</span><span>Lịch học</span>
          </Link>
          <Link href="/student/courses/progress" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined">insights</span><span>Tiến độ học tập</span>
          </Link>
          <Link href="/student/courses/learning-space" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">cast_for_education</span><span>Không gian học tập</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-72 flex flex-col">
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-headline-md font-headline-md text-on-surface">Tiến độ học tập</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-fixed text-[18px]">person</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
            <p className="text-on-surface-variant">Đang tính toán tiến độ học tập thực tế...</p>
          </div>
        ) : (
          <main className="p-margin-desktop flex-1">
            <div className="max-w-container-max mx-auto space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{overallProgress}%</p>
                    <p className="text-xs text-on-surface-variant">Tiến độ tổng</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{totalHours}h</p>
                    <p className="text-xs text-on-surface-variant">Tổng giờ học</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{completedLessons}/{totalLessons}</p>
                    <p className="text-xs text-on-surface-variant">Bài hoàn thành</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined">military_tech</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{BADGES.length}</p>
                    <p className="text-xs text-on-surface-variant">Thành tích đạt được</p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Circular Charts */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-6 flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
                    Tổng quan tiến độ
                  </h3>
                  <div className="flex justify-around flex-wrap gap-6">
                    {courses.length === 0 ? (
                      <p className="text-sm text-on-surface-variant py-8">Chưa có dữ liệu tiến độ.</p>
                    ) : (
                      courses.map((course) => (
                        <CircularProgress
                          key={course.id}
                          value={course.progress}
                          label={course.name}
                          sublabel={`${course.completedChapters}/${course.totalChapters} bài học`}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-6 flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
                    Hoạt động tuần này
                  </h3>
                  <WeeklyBarChart data={WEEKLY_DATA} />
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-sm">
                    <span className="text-on-surface-variant">Tổng tuần này:</span>
                    <span className="font-bold text-primary">{WEEKLY_DATA.reduce((a, d) => a + d.hours, 0)} giờ</span>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="p-5 border-b border-outline-variant/20 bg-surface-container-low/30">
                  <h3 className="font-headline-md text-on-surface flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-primary text-[20px]">library_books</span>
                    Chi tiết từng khóa học
                  </h3>
                </div>
                <div className="divide-y divide-outline-variant/15">
                  {courses.length === 0 ? (
                    <p className="text-sm text-on-surface-variant p-8 text-center">Bạn chưa đăng ký khóa học nào.</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="p-5 hover:bg-surface-container-low/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-on-surface mb-1">{course.name}</h4>
                            <p className="text-xs text-on-surface-variant mb-3">{course.lecturer}</p>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all duration-1000`} style={{ width: `${course.progress}%` }} />
                              </div>
                              <span className="text-sm font-bold text-on-surface min-w-[40px] text-right">{course.progress}%</span>
                            </div>
                          </div>
                          <div className="flex gap-6 text-center">
                            <div>
                              <p className="text-lg font-bold text-on-surface">{course.completedChapters}/{course.totalChapters}</p>
                              <p className="text-xs text-on-surface-variant">Bài học</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-on-surface">{course.avgScore > 0 ? course.avgScore.toFixed(1) : "—"}</p>
                              <p className="text-xs text-on-surface-variant">Điểm TB</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-on-surface">{course.totalHours}h</p>
                              <p className="text-xs text-on-surface-variant">Giờ học</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Row: Badges + Timeline */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Badges */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-5 flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">emoji_events</span>
                    Thành tích đạt được
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {BADGES.map((badge) => (
                      <div key={badge.name} className="p-4 rounded-xl border border-outline-variant/20 hover:border-primary/20 hover:shadow-sm transition-all flex items-center gap-3 group cursor-default">
                        <div className={`w-10 h-10 rounded-xl ${badge.bg} ${badge.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined">{badge.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{badge.name}</p>
                          <p className="text-xs text-on-surface-variant">{badge.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-5 flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-4">
                    {RECENT_ACTIVITIES.map((activity, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center ${activity.color}`}>
                            <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                          </div>
                          {idx < RECENT_ACTIVITIES.length - 1 && <div className="w-px flex-1 bg-outline-variant/30 mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm text-on-surface">{activity.title}</p>
                          <p className="text-xs text-on-surface-variant">{activity.course} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
