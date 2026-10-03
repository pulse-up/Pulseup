import {
    useCallback,
    useEffect,
    useState,
} from "react";
import api from "../api/api";
import YEAR_OF_STUDY_OPTIONS
    from "../constants/yearOfStudyOptions";
import "./StudentProfile.css";

const RESIDENCE_OPTIONS = [
    "CPUT Residence",
    "Accredited Private Residence",
    "Private Student Residence",
    "Off-campus Rental",
    "Living at Home",
    "Other",
];

const EMPTY_PROFILE = {
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    course: "",
    campus: "",
    residence: "",
    yearOfStudy: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
};

function StudentProfile({
                            onProfileUpdated,
                        }) {
    const [profile, setProfile] =
        useState(EMPTY_PROFILE);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await api.get(
                "/students/me",
            );

            setProfile({
                ...EMPTY_PROFILE,
                ...response.data,
            });
        } catch (error) {
            console.error(
                "Student profile loading error:",
                {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                },
            );

            const status =
                error.response?.status;

            if (status === 401) {
                setErrorMessage(
                    "Your login session has expired. Sign out and sign in again.",
                );
            } else if (status === 403) {
                setErrorMessage(
                    "The backend security configuration is blocking access to your profile.",
                );
            } else if (status === 404) {
                setErrorMessage(
                    "No student record was found for the currently signed-in account.",
                );
            } else if (status === 500) {
                setErrorMessage(
                    "The backend failed while reading your student profile.",
                );
            } else if (!error.response) {
                setErrorMessage(
                    "Could not connect to the backend. Confirm that Spring Boot is running.",
                );
            } else {
                setErrorMessage(
                    `Could not load your profile. Server returned ${status}.`,
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        window.queueMicrotask(() => {
            if (!cancelled) {
                void loadProfile();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [loadProfile]);

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile((currentProfile) => ({
            ...currentProfile,
            [name]: value,
        }));

        setSuccessMessage("");
        setErrorMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setSuccessMessage("");
            setErrorMessage("");

            const requestBody = {
                firstName:
                    profile.firstName.trim(),

                lastName:
                    profile.lastName.trim(),

                email:
                    profile.email.trim(),

                phoneNumber:
                    profile.phoneNumber.trim(),

                course:
                    profile.course.trim(),

                campus:
                    profile.campus.trim(),

                residence:
                profile.residence,

                yearOfStudy:
                profile.yearOfStudy,

                emergencyContactName:
                    profile.emergencyContactName
                        ?.trim() || null,

                emergencyContactPhone:
                    profile.emergencyContactPhone
                        ?.trim() || null,
            };

            const response = await api.put(
                "/students/me/profile",
                requestBody,
            );

            const updatedProfile = {
                ...EMPTY_PROFILE,
                ...response.data,
            };

            setProfile(updatedProfile);

            onProfileUpdated?.(
                response.data,
            );

            setSuccessMessage(
                "Your profile was updated successfully.",
            );
        } catch (error) {
            console.error(
                "Student profile update error:",
                {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                },
            );

            const status =
                error.response?.status;

            if (status === 400) {
                setErrorMessage(
                    "Complete all required fields before saving.",
                );
            } else if (status === 401) {
                setErrorMessage(
                    "Your login session has expired.",
                );
            } else if (status === 403) {
                setErrorMessage(
                    "You are not authorised to update this profile.",
                );
            } else if (status === 404) {
                setErrorMessage(
                    "Your student record could not be found.",
                );
            } else {
                setErrorMessage(
                    "Your profile could not be updated.",
                );
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <article className="dashboard-panel profile-panel">
                <p>Loading your profile...</p>
            </article>
        );
    }

    return (
        <article className="dashboard-panel profile-panel">
            <div className="profile-heading">
                <div>
                    <p className="eyebrow">
                        STUDENT PROFILE
                    </p>

                    <h2>
                        Personal information
                    </h2>

                    <p>
                        Update your personal,
                        academic and residence
                        information.
                    </p>
                </div>

                <div className="profile-student-number">
                    <span>
                        STUDENT NUMBER
                    </span>

                    <strong>
                        {profile.studentNumber ||
                            "Not available"}
                    </strong>
                </div>
            </div>

            {successMessage && (
                <p className="profile-success-message">
                    {successMessage}
                </p>
            )}

            {errorMessage && (
                <p className="profile-error-message">
                    {errorMessage}
                </p>
            )}

            <form
                className="profile-form"
                onSubmit={handleSubmit}
            >
                <label>
                    First name

                    <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Last name

                    <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Email address

                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Phone number

                    <input
                        type="tel"
                        name="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Course

                    <input
                        type="text"
                        name="course"
                        value={profile.course}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Campus

                    <input
                        type="text"
                        name="campus"
                        value={profile.campus}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </label>

                <label>
                    Residence

                    <select
                        name="residence"
                        value={
                            profile.residence || ""
                        }
                        onChange={handleChange}
                        required
                        disabled={saving}
                    >
                        <option value="">
                            Select residence
                        </option>

                        {RESIDENCE_OPTIONS.map(
                            (residence) => (
                                <option
                                    key={residence}
                                    value={residence}
                                >
                                    {residence}
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <label>
                    Year of study

                    <select
                        name="yearOfStudy"
                        value={
                            profile.yearOfStudy || ""
                        }
                        onChange={handleChange}
                        required
                        disabled={saving}
                    >
                        <option value="">
                            Select year of study
                        </option>

                        {YEAR_OF_STUDY_OPTIONS.map(
                            (yearOption) => (
                                <option
                                    key={
                                        yearOption.value
                                    }
                                    value={
                                        yearOption.value
                                    }
                                >
                                    {
                                        yearOption.label
                                    }
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <label>
                    Emergency contact name

                    <input
                        type="text"
                        name="emergencyContactName"
                        value={
                            profile
                                .emergencyContactName ||
                            ""
                        }
                        onChange={handleChange}
                        disabled={saving}
                    />
                </label>

                <label>
                    Emergency contact phone

                    <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={
                            profile
                                .emergencyContactPhone ||
                            ""
                        }
                        onChange={handleChange}
                        disabled={saving}
                    />
                </label>

                <div className="profile-form-actions">
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            saving ||
                            Boolean(errorMessage)
                        }
                    >
                        {saving
                            ? "Saving changes..."
                            : "Save profile changes"}
                    </button>
                </div>
            </form>
        </article>
    );
}

export default StudentProfile;