/**
 * Student Management System - Client-side Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Sidebar Toggle & Backdrop
  const sidebar = document.getElementById('appSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show-sidebar');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show-sidebar');
      backdrop.classList.remove('show');
    });
  }

  // 2. Delete Confirmation Modal Setup
  const deleteModal = document.getElementById('deleteConfirmModal');
  const deleteForm = document.getElementById('deleteStudentForm');
  const studentNameToDelete = document.getElementById('studentNameToDelete');

  if (deleteModal && deleteForm) {
    deleteModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const studentId = button.getAttribute('data-student-id');
      const studentName = button.getAttribute('data-student-name');
      const rollNumber = button.getAttribute('data-student-roll');

      // Set action URL on the delete form
      deleteForm.setAttribute('action', `/students/${studentId}?_method=DELETE`);
      
      if (studentNameToDelete) {
        studentNameToDelete.textContent = `${studentName} (Roll No: ${rollNumber || 'N/A'})`;
      }
    });
  }

  // 3. Auto-dismiss alerts after 5 seconds
  const autoAlerts = document.querySelectorAll('.alert-auto-dismiss');
  autoAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s ease';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // 4. Password validation helper on forms
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      const pwd = document.getElementById('password');
      const confirmPwd = document.getElementById('confirmPassword');
      if (pwd && confirmPwd && pwd.value !== confirmPwd.value) {
        e.preventDefault();
        alert('Passwords do not match! Please check and try again.');
        confirmPwd.focus();
      }
    });
  }
});
