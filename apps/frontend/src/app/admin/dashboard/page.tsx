"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";

export default function Page() {
  const { user } = useAdminUser();

  return (
    <section className="section-page flex flex-col items-center justify-center">
      <h1 className="text-center text-6xl font-black uppercase md:text-8xl">
        ADMINISTRATION MODE
      </h1>

      <div className="mt-12 text-center text-xl font-bold uppercase md:text-3xl">
        <p>NAME : {user.display_name}</p>
        <p>EMAIL : {user.email}</p>
        <p>TYPE : {user.role}</p>
      </div>
    </section>
  );
}
