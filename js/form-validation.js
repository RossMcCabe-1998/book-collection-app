// Wait for DOM to be ready
$(function() {
  // Initialize form validation on the registration form.
  $("#contactUsForm").validate({
    // Specify validation rules
    rules: {
      firstName: "required",
      lastName: "required",
      email: {
        required: true,
        email: true
      },
    },
    // validation error messages
    messages: {
      firstName: "Please enter your firstname",
      lastName: "Please enter your lastname",
      email: "Please enter a valid email address"
    },
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      form.submit();
    }
  });
});