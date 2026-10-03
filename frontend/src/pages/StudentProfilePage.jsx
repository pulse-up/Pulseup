import { useEffect, useRef, useState } from 'react';

import YEAR_OF_STUDY_OPTIONS from '../constants/yearOfStudyOptions';
import {
  STUDENT_IMAGE_KEY,
  STUDENT_PROFILE_EVENT,
  fetchStudentProfile,
  getStudentDetails,
  getStudentInitials,
  isStudentAccount,
  saveStudentDetails,
  saveStudentDetailsToBackend,
} from '../utils/studentProfile';
import './StudentProfilePage.css';

const RELATIONSHIPS = ['Parent', 'Sibling', 'Guardian', 'Partner', 'Other'];

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function StudentProfilePage() {
  const fileInputReference = useRef(null);

  const [savedDetails, setSavedDetails] = useState(getStudentDetails);
  const [form, setForm] = useState(savedDetails);
  const [image, setImage] = useState(
    () => localStorage.getItem(STUDENT_IMAGE_KEY) || '',
  );
  const [message, setMessage] = useState({ text: '', type: '' });

  const isNewProfile = !savedDetails.fullName;

  // University employees have no study details, so those fields are hidden.
  const isStudent = isStudentAccount();

  // Load what the server already knows as soon as the page opens.
  useEffect(() => {
    let cancelled = false;

    fetchStudentProfile()
      .then((details) => {
        if (details && !cancelled) {
          setSavedDetails(details);
          setForm(details);
        }
      })
      .catch((error) => {
        console.error('Could not load the saved profile:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setMessage({ text: '', type: '' });
  }

  function handleImageChange(event) {
    const [file] = event.target.files;

    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please choose an image file.', type: 'error' });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setMessage({
        text: 'Please choose an image smaller than 2 MB.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = String(reader.result);

      try {
        localStorage.setItem(STUDENT_IMAGE_KEY, imageData);
      } catch (error) {
        console.error('Could not save the profile photo:', error);

        setMessage({ text: 'The photo could not be saved.', type: 'error' });
        return;
      }

      setImage(imageData);

      window.dispatchEvent(new Event(STUDENT_PROFILE_EVENT));
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    localStorage.removeItem(STUDENT_IMAGE_KEY);

    setImage('');

    window.dispatchEvent(new Event(STUDENT_PROFILE_EVENT));
  }

  function handleReset() {
    setForm(savedDetails);

    setMessage({ text: '', type: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    );

    saveStudentDetails(cleanedForm);

    setSavedDetails(cleanedForm);
    setForm(cleanedForm);

    try {
      await saveStudentDetailsToBackend(cleanedForm);

      setMessage({ text: 'Profile saved successfully.', type: 'success' });
    } catch (error) {
      console.error('Could not save the profile to the server:', error);

      setMessage({
        text: 'Saved on this device, but the server could not be updated.',
        type: 'error',
      });
    }
  }

  return (
    <div className="sp-page">
      <form className="sp-form" onSubmit={handleSubmit}>
        <div className="sp-action-bar">
          {message.text && (
            <p className={`sp-message sp-message-${message.type}`} role="status">
              {message.text}
            </p>
          )}

          <button type="button" className="sp-button-reset" onClick={handleReset}>
            Reset
          </button>

          <button type="submit" className="sp-button-save">
            Save Profile
          </button>
        </div>

        <section className="sp-card">
          <div className="sp-header">
            <div className="sp-avatar-wrap">
              <button
                type="button"
                className="sp-avatar"
                aria-label="Change profile photo"
                onClick={() => fileInputReference.current?.click()}
              >
                {image ? (
                  <img src={image} alt="" />
                ) : (
                  getStudentInitials(form.fullName)
                )}

                <span className="sp-avatar-overlay">Change</span>
              </button>

              <input
                ref={fileInputReference}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <div>
              <h2>{form.fullName || (isStudent ? 'New Student Profile' : 'New Profile')}</h2>

              <span className="sp-badge">
                {isNewProfile ? 'New User' : isStudent ? 'Active Student' : 'Active Staff'}
              </span>

              {image && (
                <button
                  type="button"
                  className="sp-link-button"
                  onClick={handleRemoveImage}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <h3 className="sp-section-label">Personal Details</h3>

          <div className="sp-grid">
            <label className="sp-field">
              Full Name
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </label>

            {isStudent ? (
              <label className="sp-field">
                Student Number
                <input
                  type="text"
                  name="studentNumber"
                  placeholder="9-digit student ID"
                  pattern="\d{9}"
                  title="Enter your 9-digit student number"
                  value={form.studentNumber}
                  onChange={handleChange}
                  required
                />
              </label>
            ) : (
              <label className="sp-field">
                Employee Number
                <input
                  type="text"
                  name="employeeNumber"
                  value={form.employeeNumber}
                  onChange={handleChange}
                />
              </label>
            )}

            <label className="sp-field">
              Email Address
              <input
                type="email"
                name="email"
                placeholder="student@mycput.ac.za"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="sp-field">
              Phone Number
              <input
                type="tel"
                name="phone"
                placeholder="+27 ..."
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {isStudent ? (
            <>
          <h3 className="sp-section-label">Study Details</h3>

          <div className="sp-grid">
            <label className="sp-field">
              Course
              <input
                type="text"
                name="course"
                placeholder="e.g. Diploma in ICT"
                value={form.course}
                onChange={handleChange}
              />
            </label>

            <label className="sp-field">
              Year of Study
              <select
                name="yearOfStudy"
                value={form.yearOfStudy}
                onChange={handleChange}
              >
                <option value="">Select year</option>

                {YEAR_OF_STUDY_OPTIONS.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="sp-field">
              Campus
              <input
                type="text"
                name="campus"
                value={form.campus}
                onChange={handleChange}
              />
            </label>

            <label className="sp-field">
              Residence
              <input
                type="text"
                name="residence"
                value={form.residence}
                onChange={handleChange}
              />
            </label>
          </div>
            </>
          ) : (
            <>
          <h3 className="sp-section-label">Work Details</h3>

          <div className="sp-grid">
            <label className="sp-field">
              Job Title
              <input
                type="text"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
              />
            </label>

            <label className="sp-field">
              Department
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </label>

            <label className="sp-field">
              Campus
              <input
                type="text"
                name="campus"
                value={form.campus}
                onChange={handleChange}
              />
            </label>
          </div>
            </>
          )}

          <h3 className="sp-section-label">Emergency Contact</h3>

          <div className="sp-grid">
            <label className="sp-field">
              Contact Name
              <input
                type="text"
                name="emergencyName"
                placeholder="Next of kin name"
                value={form.emergencyName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="sp-field">
              Relationship
              <select
                name="emergencyRelation"
                value={form.emergencyRelation}
                onChange={handleChange}
              >
                <option value="">Select relationship</option>

                {RELATIONSHIPS.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {relationship}
                  </option>
                ))}
              </select>
            </label>

            <label className="sp-field">
              Contact Phone
              <input
                type="tel"
                name="emergencyPhone"
                placeholder="+27 ..."
                value={form.emergencyPhone}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </section>

        <aside className="sp-card sp-health-card">
          <h3 className="sp-section-label sp-section-label-first">
            Health Snapshot
          </h3>

          <label className="sp-field">
            Blood Type
            <select
              name="bloodType"
              value={form.bloodType}
              onChange={handleChange}
            >
              <option value="">Not sure</option>

              {BLOOD_TYPES.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {bloodType}
                </option>
              ))}
            </select>
          </label>

          <h3 className="sp-section-label">Known Allergies</h3>

          <label className="sp-field">
            <input
              type="text"
              name="allergies"
              placeholder="e.g. Peanuts, Penicillin"
              value={form.allergies}
              onChange={handleChange}
            />

            <small>Separate with commas</small>
          </label>
        </aside>
      </form>
    </div>
  );
}

export default StudentProfilePage;
