"use client";

import { Person } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContextProvider";

/* =========================================================
   AGE CALCULATION
========================================================= */

const calculateAge = (
  dob?: string | null,
  dod?: string | null,
): number | null => {
  if (!dob) return null;

  const birthDate = new Date(`${dob}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const endDate = dod ? new Date(`${dod}T00:00:00`) : new Date();

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  // Don't calculate an age for an invalid/future DOB.
  if (birthDate > endDate) {
    return null;
  }

  let age = endDate.getFullYear() - birthDate.getFullYear();

  const monthDifference = endDate.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && endDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(age, 0);
};

/* =========================================================
   FORMAT AGE
========================================================= */

const getPersonAge = (person?: Person | null): number | null => {
  if (!person) return null;

  return calculateAge(person.dob, person.dod);
};

/* =========================================================
   DETAILS BAR
========================================================= */

const DetailsBar = () => {
  // const { addNode, createFirstNode, updatePerson, deletePerson } = useData();

  const {
    nodes,
    edges,
    setSelectedPerson,
    selectedPerson,
    setSelectedPersonRef,
    addNode,
    createFirstNode,
    updatePerson,
    deletePerson,
  } = useCanvas();

  const { loadTestFamilyTree } = useCanvas();

  const [search, setSearch] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);

  /*
   * =========================================================
   * EDIT FORM
   * =========================================================
   */

  const [editGender, setEditGender] = useState("");

  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  /*
   * =========================================================
   * ADD NODE FORM
   * =========================================================
   */

  const [newNodeGender, setNewNodeGender] = useState("");

  const [newNodePreview, setNewNodePreview] = useState<string | null>(null);

  const profileImageRef = useRef<HTMLInputElement>(null);

  const newNodeImageRef = useRef<HTMLInputElement>(null);

  const hasNodes = Array.isArray(nodes) && nodes.length > 0;

  /*
   * =========================================================
   * ALIVE / DECEASED COUNTS
   *
   * A FamilyUnit can contain:
   * - person
   * - spouse
   *
   * We use a Map by person.id so nobody gets counted twice.
   * =========================================================
   */

  const { aliveCount, deceasedCount } = React.useMemo(() => {
    const people = new Map<string, Person>();

    nodes.forEach((node) => {
      const person = node.data?.person as Person | undefined;
      const spouse = node.data?.spouse as Person | undefined;

      if (person?.id) {
        people.set(person.id, person);
      }

      if (spouse?.id) {
        people.set(spouse.id, spouse);
      }
    });

    let alive = 0;
    let deceased = 0;

    people.forEach((person) => {
      if (person.dod) {
        deceased++;
      } else {
        alive++;
      }
    });

    return {
      aliveCount: alive,
      deceasedCount: deceased,
    };
  }, [nodes]);

  /*
   * =========================================================
   * SEARCH RESULTS
   * =========================================================
   */

  const normalizedSearch = search.trim().toLowerCase();

  const searchResults = normalizedSearch
    ? nodes
        .flatMap((node) => {
          const person = node.data?.person as Person | undefined;

          const spouse = node.data?.spouse as Person | undefined;

          const results: {
            person: Person;
            unitId: string;
          }[] = [];

          if (person && person.name.toLowerCase().includes(normalizedSearch)) {
            results.push({
              person,
              unitId: node.id,
            });
          }

          if (spouse && spouse.name.toLowerCase().includes(normalizedSearch)) {
            results.push({
              person: spouse,
              unitId: node.id,
            });
          }

          return results;
        })
        .filter(
          (item, index, array) =>
            array.findIndex((result) => result.person.id === item.person.id) ===
            index,
        )
    : [];

  /*
   * =========================================================
   * SELECTED PERSON CHANGED
   * =========================================================
   */

  useEffect(() => {
    setIsEditing(false);

    setProfilePreview(selectedPerson?.imageUrl || null);

    setEditGender(selectedPerson?.gender || "");

    setNewNodePreview(null);

    setNewNodeGender("");
  }, [selectedPerson]);

  /*
   * =========================================================
   * PROFILE IMAGE
   * =========================================================
   */

  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  /*
   * =========================================================
   * NEW NODE IMAGE
   * =========================================================
   */

  const handleNewNodeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setNewNodePreview(previewUrl);
  };

  /*
   * =========================================================
   * ADD FIRST NODE
   * =========================================================
   */

  const handleAddFirstNode = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim();

    const dob = formData.get("dob")?.toString();

    const dod = formData.get("dod")?.toString();

    const phone = formData.get("phone")?.toString().trim();

    if (!name) {
      console.error("Cannot create first node: name is required.");

      return;
    }

    const person: Person = {
      id: crypto.randomUUID(),

      name,

      dob: dob || undefined,

      dod: dod || undefined,

      gender:
        newNodeGender === "male" ||
        newNodeGender === "female" ||
        newNodeGender === "other"
          ? newNodeGender
          : undefined,

      imageUrl: newNodePreview || undefined,

      phone: phone || undefined,
    };

    await createFirstNode(person);

    form.reset();

    setNewNodeGender("");

    setNewNodePreview(null);

    if (newNodeImageRef.current) {
      newNodeImageRef.current.value = "";
    }
  };

  /*
   * =========================================================
   * ADD FAMILY MEMBER
   * =========================================================
   */

  const handleAddFamilyMember = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim();

    const dob = formData.get("dob")?.toString();

    const dod = formData.get("dod")?.toString();

    const relationship = formData.get("relationship")?.toString();

    const phone = formData.get("phone")?.toString().trim();

    if (!name) {
      console.error("Cannot add family member: name is required.");

      return;
    }

    if (!selectedPerson) {
      console.error("Cannot add family member: no person selected.");

      return;
    }

    if (!relationship) {
      console.error("Cannot add family member: relationship is required.");

      return;
    }

    const selectedNode = nodes.find((node) => {
      const person = node.data?.person as Person | undefined;

      const spouse = node.data?.spouse as Person | undefined;

      return (
        person?.id === selectedPerson.id || spouse?.id === selectedPerson.id
      );
    });

    if (!selectedNode) {
      console.error("Could not find FamilyUnit for selected person.");

      return;
    }

    const familyUnitId = selectedNode.id;

    const person: Person = {
      id: crypto.randomUUID(),

      name,

      dob: dob || undefined,

      dod: dod || undefined,

      gender:
        newNodeGender === "male" ||
        newNodeGender === "female" ||
        newNodeGender === "other"
          ? newNodeGender
          : undefined,

      imageUrl: newNodePreview || undefined,

      phone: phone || undefined,
    };

    if (relationship === "child") {
      await addNode({
        type: "child",

        parentUnitId: familyUnitId,

        person,
      });
    } else if (relationship === "spouse") {
      await addNode({
        type: "spouse",

        unitId: familyUnitId,

        person,
      });
    } else {
      console.warn(`Relationship "${relationship}" is not implemented yet.`);

      return;
    }

    form.reset();

    setNewNodeGender("");

    setNewNodePreview(null);

    setShowAddMember(false);

    if (newNodeImageRef.current) {
      newNodeImageRef.current.value = "";
    }
  };

  /*
   * =========================================================
   * SAVE EDIT
   * =========================================================
   */

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPerson) return;

    const form = event.currentTarget;

    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim();

    const dob = formData.get("dob")?.toString();

    const dod = formData.get("dod")?.toString();

    const phone = formData.get("phone")?.toString().trim();

    if (!name) {
      alert("Name is required.");

      return;
    }

    const updatedPerson: Person = {
      ...selectedPerson,

      name,

      dob: dob || undefined,

      dod: dod || undefined,

      gender:
        editGender === "male" ||
        editGender === "female" ||
        editGender === "other"
          ? editGender
          : undefined,

      imageUrl: profilePreview || undefined,

      phone: phone || undefined,
    };

    await updatePerson(updatedPerson);

    setIsEditing(false);
  };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const handleDelete = async () => {
    if (!selectedPerson) return;

    const selectedNode = nodes.find((node) => {
      const person = node.data?.person as Person | undefined;

      const spouse = node.data?.spouse as Person | undefined;

      return (
        person?.id === selectedPerson.id || spouse?.id === selectedPerson.id
      );
    });

    if (!selectedNode) {
      alert("Could not find this person in the family tree.");

      return;
    }

    const person = selectedNode.data?.person as Person;

    const spouse = selectedNode.data?.spouse as Person | undefined;

    /*
     * Only a FamilyUnit containing one person will
     * automatically remove descendants.
     */

    const deletingWholeFamilyUnit =
      !!person && !spouse && person.id === selectedPerson.id;

    let message = `Are you sure you want to delete "${selectedPerson.name}"?`;

    if (deletingWholeFamilyUnit) {
      message +=
        "\n\nThis FamilyUnit has no spouse. Its children and all of their descendants will also be deleted.";
    } else if (spouse) {
      message += "\n\nThe other spouse will remain in the family tree.";
    }

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    await deletePerson(selectedPerson.id);

    setIsEditing(false);
  };

  /*
   * =========================================================
   * CANCEL EDIT
   * =========================================================
   */

  const handleCancelEdit = () => {
    setIsEditing(false);

    setProfilePreview(selectedPerson?.imageUrl || null);

    setEditGender(selectedPerson?.gender || "");

    if (profileImageRef.current) {
      profileImageRef.current.value = "";
    }
  };

  /*
   * =========================================================
   * DELETE PERSON
   * =========================================================
   */

  const handleDeletePerson = async () => {
    if (!selectedPerson) {
      return;
    }

    try {
      await deletePerson(selectedPerson.id);

      setIsEditing(false);

      setProfilePreview(null);
    } catch (error) {
      console.error("Failed to delete person:", error);
    }
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <aside className="flex h-1/2 lg:h-full w-full lg:w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Family Tree
            </h2>

            <div className="flex shrink-0 items-center gap-1.5">
              {/* Alive count */}

              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600"
                title={`${aliveCount} alive`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {aliveCount} <p>alive</p>
              </span>

              {/* Deceased count */}

              <span
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                title={`${deceasedCount} deceased`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {deceasedCount} <p>died</p>
              </span>
            </div>
          </div>

          {/* Optional total */}

          <span className="text-[10px] text-slate-400">
            {aliveCount + deceasedCount} people
          </span>
        </div>

        <div className="relative mt-3">
          <SearchIcon />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* ===================================================
            SEARCH RESULTS
        ==================================================== */}

        {normalizedSearch && (
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {searchResults.length > 0 ? (
              <div className="max-h-52 overflow-y-auto py-1">
                {searchResults.map((result) => {
                  const isSelected = selectedPerson?.id === result.person.id;

                  return (
                    <button
                      key={result.person.id}
                      type="button"
                      onClick={() => {
                        setSelectedPersonRef.current?.(result.person);

                        setSearch("");
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                        isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                        {result.person.imageUrl ? (
                          <img
                            src={result.person.imageUrl}
                            alt={result.person.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          result.person.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">
                          {result.person.name}
                        </p>

                        <p className="text-[11px] capitalize text-slate-400">
                          {result.person.gender || "Gender not specified"}
                        </p>
                      </div>

                      {/* Show deceased status in search */}

                      {result.person.dod && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                          Deceased
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-3 text-center text-xs text-slate-500">
                No nodes found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* ===================================================
            NO NODES
        ==================================================== */}

        {!hasNodes ? (
          <EmptyState
            gender={newNodeGender}
            setGender={setNewNodeGender}
            preview={newNodePreview}
            imageRef={newNodeImageRef}
            onImageChange={handleNewNodeImage}
            onSubmit={handleAddFirstNode}
            onLoadTestTree={loadTestFamilyTree}
          />
        ) : !selectedPerson ? (
          <NoNodeSelectedState />
        ) : (
          <>
            {/* =================================================
                SELECTED PERSON
            ================================================== */}

            <section className="border-b border-slate-100 px-4 py-4">
              <div
                className={`group relative h-52 w-full overflow-hidden rounded-xl bg-slate-100 ${
                  isEditing ? "cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (isEditing) {
                    profileImageRef.current?.click();
                  }
                }}
              >
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={selectedPerson.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-4xl font-semibold text-slate-300 shadow-sm">
                      {selectedPerson.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/40 to-transparent px-3 pb-3 pt-8">
                    <span className="flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                      <CameraIcon />
                      Change photo
                    </span>
                  </div>
                )}

                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleProfileImage}
                />
              </div>

              {/* =================================================
                  NAME + ACTION BUTTONS
              ================================================== */}

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {selectedPerson.name}
                    </h3>

                    {selectedPerson.dod ? (
                      <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                        Deceased
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
                        Alive
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs capitalize text-slate-500">
                    {selectedPerson.gender || "Gender not specified"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {/* EDIT BUTTON */}

                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        handleCancelEdit();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition ${
                      isEditing
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>

                  {/* DELETE BUTTON */}

                  <button
                    type="button"
                    onClick={handleDeletePerson}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                    title="Delete family member"
                    aria-label={`Delete ${selectedPerson.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="border-b border-slate-100 px-4 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Personal information
              </h3>

              {isEditing ? (
                <form className="space-y-3.5" onSubmit={handleSaveEdit}>
                  <Field
                    label="Name"
                    id="edit-name"
                    name="name"
                    defaultValue={selectedPerson.name}
                  />

                  <Field
                    label="Date of birth"
                    id="edit-dob"
                    name="dob"
                    type="date"
                    defaultValue={selectedPerson.dob}
                  />

                  <Field
                    label="Date of death"
                    id="edit-dod"
                    name="dod"
                    type="date"
                    defaultValue={selectedPerson.dod}
                  />

                  <GenderSelector value={editGender} onChange={setEditGender} />

                  <Field
                    label="Phone"
                    id="edit-phone"
                    name="phone"
                    defaultValue={selectedPerson.phone}
                    placeholder="Enter phone number"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Save changes
                  </button>
                </form>
              ) : (
                <div>
                  <InfoRow label="Name" value={selectedPerson.name} />

                  <InfoRow label="Date of birth" value={selectedPerson.dob} />

                  <InfoRow label="Date of death" value={selectedPerson.dod} />

                  <InfoRow
                    label={selectedPerson.dod ? "Age at death" : "Age"}
                    value={getPersonAge(selectedPerson)}
                  />

                  <InfoRow
                    label="Gender"
                    value={selectedPerson.gender}
                    capitalize
                  />

                  <InfoRow label="Phone" value={selectedPerson.phone} />
                </div>
              )}
            </section>

            {/* =================================================
                ADD FAMILY MEMBER
            ================================================== */}

            <section className="px-4 py-4">
              <button
                type="button"
                onClick={() => setShowAddMember((current) => !current)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Add family member
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Add a child or spouse.
                  </p>
                </div>

                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition ${
                    showAddMember ? "rotate-180" : ""
                  }`}
                >
                  <ArrowDown />
                </span>
              </button>

              {showAddMember && (
                <div className="mt-4">
                  <p className="mb-4 text-xs leading-5 text-slate-500">
                    Add a new member connected to{" "}
                    <span className="font-medium text-slate-700">
                      {selectedPerson.name}
                    </span>
                    .
                  </p>

                  <form
                    className="space-y-3.5"
                    onSubmit={handleAddFamilyMember}
                  >
                    <Field
                      label="Name"
                      id="node-name"
                      name="name"
                      placeholder="Enter full name"
                      required={true}
                    />

                    <Field
                      label="Date of birth"
                      id="node-dob"
                      name="dob"
                      type="date"
                    />

                    <Field
                      label="Date of death"
                      id="node-dod"
                      name="dod"
                      type="date"
                    />

                    <GenderSelector
                      value={newNodeGender}
                      onChange={setNewNodeGender}
                    />

                    <div>
                      <label
                        htmlFor="relationship"
                        className="mb-1.5 block text-xs font-medium text-slate-600"
                      >
                        Relationship
                      </label>

                      <select
                        id="relationship"
                        name="relationship"
                        defaultValue=""
                        required
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      >
                        <option value="" disabled>
                          Select relationship
                        </option>

                        <option value="child">Child</option>

                        <option value="spouse">Spouse</option>

                        {/* <option value="parent">Parent</option>

                        <option value="sibling">Sibling</option> */}
                      </select>
                    </div>

                    <Field
                      label="Phone"
                      id="node-phone"
                      name="phone"
                      placeholder="Optional"
                    />

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">
                        Profile photo
                        <span className="ml-1 font-normal text-slate-400">
                          Optional
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => newNodeImageRef.current?.click()}
                        className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50"
                      >
                        {newNodePreview ? (
                          <>
                            <img
                              src={newNodePreview}
                              alt="New member preview"
                              className="h-full w-full object-cover"
                            />

                            <span className="absolute bottom-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                              Change photo
                            </span>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                              <PlusIcon />
                            </div>

                            <p className="mt-1.5 text-xs font-medium text-slate-600">
                              Upload photo
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              PNG, JPG or WEBP
                            </p>
                          </div>
                        )}
                      </button>

                      <input
                        ref={newNodeImageRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleNewNodeImage}
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      <PlusIcon />
                      Add family member
                    </button>
                  </form>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  );
};

/* =========================================================
   FIELD
========================================================= */

const Field = ({
  label,
  id,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = false,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>

      <input
        id={id}
        required={required}
        name={name}
        type={label === "Phone" ? "number" : type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
};

/* =========================================================
   GENDER SELECTOR
========================================================= */

const GenderSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const genders = ["male", "female", "other"];

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        Gender
      </label>

      <div className="grid grid-cols-3 gap-1.5">
        {genders.map((gender) => {
          const selected = value === gender;

          return (
            <button
              key={gender}
              type="button"
              onClick={() => onChange(gender)}
              className={`rounded-md border px-2 py-2.5 text-xs capitalize transition ${
                selected
                  ? "border-blue-500 bg-blue-50 font-medium text-blue-600"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {gender}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   INFO ROW
========================================================= */

const InfoRow = ({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value?: string | number | null;
  capitalize?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>

      <span
        className={`truncate text-right text-sm font-medium text-slate-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value !== undefined && value !== null && value !== "" ? value : "—"}
      </span>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  gender,
  setGender,
  preview,
  imageRef,
  onImageChange,
  onSubmit,
  onLoadTestTree,
}: {
  gender: string;

  setGender: (value: string) => void;

  preview: string | null;

  imageRef: React.RefObject<HTMLInputElement | null>;

  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  onLoadTestTree: () => Promise<void>;
}) => {
  return (
    <div className="px-4 py-5">
      {/* Intro */}

      <div className="mb-5">
        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          Create your family tree
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Add your first family member to start building your family tree.
        </p>
      </div>

      {/* ===================================================
          TEST FAMILY TREE
      ==================================================== */}

      <button
        type="button"
        onClick={onLoadTestTree}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      >
        <TreeIcon />
        Load test family tree
      </button>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          or add manually
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Add first node */}

      <section>
        <h4 className="text-sm font-semibold text-slate-900">
          Add first member
        </h4>

        <form className="mt-4 space-y-3.5" onSubmit={onSubmit}>
          <Field
            label="Name"
            id="first-node-name"
            name="name"
            placeholder="Enter full name"
          />

          <Field
            label="Date of birth"
            id="first-node-dob"
            name="dob"
            type="date"
          />

          <Field
            label="Date of death"
            id="first-node-dod"
            name="dod"
            type="date"
          />

          <GenderSelector value={gender} onChange={setGender} />

          <Field
            label="Phone"
            id="first-node-phone"
            name="phone"
            placeholder="phone"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Profile photo
              <span className="ml-1 font-normal text-slate-400">Optional</span>
            </label>

            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50"
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute bottom-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                    Change photo
                  </span>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <PlusIcon />
                  </div>

                  <p className="mt-1.5 text-xs font-medium text-slate-600">
                    Upload photo
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    PNG, JPG or WEBP
                  </p>
                </div>
              )}
            </button>

            <input
              ref={imageRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onImageChange}
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <PlusIcon />
            Add first member
          </button>
        </form>
      </section>
    </div>
  );
};

/* =========================================================
   NO NODE SELECTED
========================================================= */

const NoNodeSelectedState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <UserIcon />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-900">
        No node selected
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        Select a person from the tree to view their details.
      </p>
    </div>
  );
};

/* =========================================================
   ICONS
========================================================= */

const SearchIcon = () => (
  <svg
    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />

    <path d="m20 20-3.5-3.5" />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CameraIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M4 7h3l1.5-2h7L17 7h3v12H4z" />

    <circle cx="12" cy="13" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />

    <path d="M8 6V4h8v2" />

    <path d="M19 6l-1 14H6L5 6" />

    <path d="M10 11v5M14 11v5" />
  </svg>
);

const TreeIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="2.5" />

    <circle cx="6" cy="18" r="2.5" />

    <circle cx="18" cy="18" r="2.5" />

    <path d="M12 7.5v5M12 12.5H6v3M12 12.5h6v3" />
  </svg>
);

const UserIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="7" r="3" />

    <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
  </svg>
);

export default DetailsBar;
