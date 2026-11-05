"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Project {
  number: string;
  name: string;
  category: string;
  description: string;
  photos: { src: string; alt: string }[];
  href?: string;
  linkLabel?: string;
}

const PROJECTS: Project[] = [
  {
    number: "02",
    name: "Tactixx",
    category: "Footbal Webapp",
    description: "A fantasy football web application.",
    photos: [
      { src: "/projects/tactix1.png", alt: "Tactixx fantasy football dashboard" },
      { src: "/projects/tactix2.png", alt: "Tactixx fantasy football interface" },
    ],
    href: "https://www.jointactix.app/",
    linkLabel: "Visit Tactixx",
  },
];

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedProject && !dialog.open) dialog.showModal();
    if (!selectedProject && dialog.open) dialog.close();
  }, [selectedProject]);

  const openProject = (project: Project) => {
    setActivePhoto(0);
    setSelectedProject(project);
  };

  return (
    <section
      id="projects"
      className="border-t border-line bg-paper py-20 sm:py-28"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="eyebrow">Selected work / beyond the run</p>
            <h2 className="display-tight mt-4 text-[clamp(2.8rem,6vw,5.6rem)]">
              MORE FROM
              <br />
              <span className="text-accent">THE CREATOR.</span>
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.number}
              project={project}
              index={index}
              onOpen={() => openProject(project)}
            />
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="project-dialog-title"
        onClose={() => setSelectedProject(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close();
          }
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-4 text-ink backdrop:bg-black/70 sm:p-8"
      >
        {selectedProject ? (
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center">
            <div className="relative max-h-[90dvh] w-full overflow-y-auto rounded-[26px] border border-line bg-surface shadow-panel">
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.16em] text-muted">
                    PROJECT / {selectedProject.number} ·{" "}
                    {selectedProject.category}
                  </p>
                  <h3
                    id="project-dialog-title"
                    className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
                  >
                    {selectedProject.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Close project details"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-xl text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.6fr]">
                <div>
                  <ProjectPhoto
                    photo={selectedProject.photos[activePhoto]!}
                    className="relative aspect-[1.65] overflow-hidden rounded-2xl border border-line bg-paper-deep"
                    large
                  />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {selectedProject.photos.map((photo, index) => (
                      <button
                        key={photo.src}
                        type="button"
                        aria-label={`Show project photo ${index + 1}`}
                        aria-pressed={activePhoto === index}
                        onClick={() => setActivePhoto(index)}
                        className={`relative aspect-[1.6] overflow-hidden rounded-xl border bg-paper-deep ${
                          activePhoto === index
                            ? "border-accent"
                            : "border-line"
                        }`}
                      >
                        <ProjectPhoto
                          photo={photo}
                          className="absolute inset-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="eyebrow">About the project</p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    {selectedProject.description}
                  </p>
                  <div className="mt-auto pt-8">
                    {selectedProject.href ? (
                      <a
                        href={selectedProject.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => dialogRef.current?.close()}
                        className="primary-button w-full"
                      >
                        {selectedProject.linkLabel ?? "Visit project"}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <p className="rounded-xl border border-line bg-paper-deep px-4 py-3 text-xs leading-5 text-muted">
                        Project link coming soon.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  return (
    <article
      className="animate-rise-in"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group w-full overflow-hidden rounded-[24px] border border-line bg-surface text-left transition-colors hover:border-accent/50"
      >
        <div className="relative">
          <ProjectPhoto
            photo={project.photos[0]!}
            className="relative aspect-[1.55] overflow-hidden border-b border-line bg-paper-deep"
          />
          <span className="absolute top-3 left-3 rounded-full border border-line/70 bg-surface/85 px-2.5 py-1 font-mono text-[8px] tracking-[0.14em] text-ink-soft backdrop-blur">
            {project.category}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[8px] tracking-[0.16em] text-muted">
                PROJECT / {project.number}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                {project.name}
              </h3>
            </div>
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-accent transition-colors group-hover:border-accent"
            >
              ↗
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            {project.description}
          </p>
          <span className="mt-4 inline-block font-mono text-[8px] tracking-[0.14em] text-accent">
            VIEW PROJECT DETAILS
          </span>
        </div>
      </button>
    </article>
  );
}

function ProjectPhoto({
  photo,
  className,
  large = false,
}: {
  photo: Project["photos"][number];
  className: string;
  large?: boolean;
}) {
  const [available, setAvailable] = useState(true);

  return (
    <div className={className}>
      {available ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={
            large
              ? "(max-width: 1024px) 100vw, 65vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setAvailable(false)}
        />
      ) : (
        <div className="line-grid absolute inset-0 grid place-items-center bg-accent-soft">
          <span className="rounded-full border border-line bg-surface/90 px-4 py-2 font-mono text-center text-[8px] tracking-[0.12em] text-muted">
            ADD IMAGE: {photo.src}
          </span>
        </div>
      )}
    </div>
  );
}
