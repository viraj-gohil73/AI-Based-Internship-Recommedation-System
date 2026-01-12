import { useState, useEffect } from "react";
import Sidebarcompany from "../components/Siderbarcompany";
import Headercompany from "../components/Headercompany";

export default function CompanyLayout({ children, title, company }) {
  const [open, setOpen] = useState(false);
  
  // const [company, setCompany] = useState({
  //   logo: "",
  //   companyName: "",
  //   email: "",
  // });

  // useEffect(() => {
  //   const fetchCompany = async () => {
  //     const token = localStorage.getItem("token");

  //     const res = await fetch("http://localhost:5000/api/company/me", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await res.json();
  //     console.log("COMPANY DATA IN LAYOUT 👉", data);
  //     setCompany({
  //     logo: data.data.logo || "",
  //     companyName: data.data.companyName || "",
  //     email: data.data.email || "",
  //   });
  //   };

  //   fetchCompany();
  // }, []);


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR (FIXED / STICKY) */}
      <Sidebarcompany open={open} onClose={() => setOpen(false)} company={company}/>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col" >

        {/* HEADER (STICKY) */}
        <div className="sticky top-0 z-30">
          <Headercompany title={title} onMenuClick={() => setOpen(true)}  />
        </div>

        {/* BODY (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto ">
          <div className="bg-white  shadow p-4 px-2 sm:py-4 min-h-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}  