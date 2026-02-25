"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";

export default function Page() {
  const { user } = useAdminUser();

  return (
    <section className="section-page flex w-full flex-1 flex-col items-center ">
      <h1 className="title1">ADMINISTRATION MODE</h1>

      <div className="flex max-w-6xl h-full flex-1 flex-col justify-center gap-(--spacing-container-modal) px-(--spacing-section-page-x) text-left text-xl md:text-3xl">
        <div>
          <p>Name : {user.display_name}</p>
          <p>Email : {user.email}</p>
        </div>

        <div>
          <p>Type : {user.role}</p>
          <div className="flex items-center gap-6">
            <p>Password :</p>
            <button type="button" className="btn-cta">
              Modifier
            </button>
          </div>
        </div>

        <div className="mt-12">
          <p>Prochain evenement : du 23 mai 2026 au 24 mai 2026</p>
        </div>
      </div>
    </section>
  );
}
