import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Lecturer Dashboard",
      description: "Manage classes, reports, and students",
    },
    {
      title: "PRL Dashboard",
      description: "Monitor lecturers and approve reports",
    },
    {
      title: "PL Dashboard",
      description: "Oversee faculty performance and reporting",
    },
    {
      title: "Student Dashboard",
      description: "Track your classes and submit feedback",
    },
  ];

  const headingStyle = { fontFamily: "Garamond, serif", color: "#001f3f" }; // Dark navy blue

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2" style={headingStyle}>
          Welcome to LUCT Dashboard
        </h1>
        <p className="text-gray-300">Select your portal to continue</p>
      </header>

      {/* Dashboard Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {dashboards.map((dash, idx) => (
          <div
            key={idx}
            className="bg-blue-900 cursor-pointer p-6 rounded-xl shadow-lg flex flex-col justify-between hover:scale-105 transform transition"
            onClick={() => navigate("/login")} // redirect to login
          >
            <h2 className="text-2xl font-bold mb-2" style={headingStyle}>
              {dash.title}
            </h2>
            <p className="text-gray-100/80">{dash.description}</p>
            <div className="mt-4 text-gray-200 font-semibold">Go →</div>
          </div>
        ))}
      </section>
    </div>
  );
}
