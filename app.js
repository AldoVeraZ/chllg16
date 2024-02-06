// Evento que se dispara cuando el contenido del DOM ha sido cargado
document.addEventListener("DOMContentLoaded", function () {
  // Carga la lista de contactos al iniciar la página
  loadContactList();
});

// Función para realizar la acción de agregar un nuevo contacto
function performAddAction() {
  // Obtiene los valores del formulario
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const birthdate = document.getElementById("birthdate").value.trim();

  // Validación de campos obligatorios
  if (name === "" || email === "" || birthdate === "") {
    showMessage("Por favor, completa todos los campos.");
    return;
  }

  // Validación de nombre único
  if (isNameExists(name)) {
    showMessage("Ya existe un contacto con este nombre.");
    clearForm();
    return;
  }

  // Validación de email único
  if (isEmailExists(email)) {
    showMessage("Ya existe un contacto con este correo electrónico.");
    clearForm();
    return;
  }

  // Genera un ID único para el nuevo contacto
  const id = generateContactId();
  const contact = { id, name, email, birthdate };

  // Agrega el nuevo contacto y actualiza la interfaz
  addContact(contact);
  clearForm();
}

// Función para realizar la acción de actualizar un contacto existente
function performUpdateAction() {
  // Obtiene los valores del formulario
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const birthdate = document.getElementById("birthdate").value.trim();
  const id = document.getElementById("contactForm").getAttribute("data-id");

  // Validación de campos obligatorios
  if (name === "" || email === "" || birthdate === "") {
    showMessage("Por favor, completa todos los campos.");
    return;
  }

  // Crea un objeto de contacto actualizado
  const contact = { id, name, email, birthdate };

  // Actualiza el contacto y la interfaz
  updateContact(contact);
  clearForm();
  document.getElementById("addButton").disabled = false;
  document.getElementById("updateButton").disabled = true;
}

// Función que verifica si ya existe un contacto con el mismo nombre
function isNameExists(name) {
  const contacts = getContacts();
  return contacts.some((contact) => contact.name === name);
}

// Función que verifica si ya existe un contacto con el mismo email
function isEmailExists(email) {
  const contacts = getContacts();
  return contacts.some((contact) => contact.email === email);
}

// Función que verifica si ya existe un contacto con el mismo nombre (para actualización)
function isNameExistsForUpdate(id, name) {
  const contacts = getContacts();
  return contacts.some((contact) => contact.id !== id && contact.name === name);
}

// Función que verifica si ya existe un contacto con el mismo email (para actualización)
function isEmailExistsForUpdate(id, email) {
  const contacts = getContacts();
  return contacts.some(
    (contact) => contact.id !== id && contact.email === email
  );
}

// Función que genera un ID único para un nuevo contacto
function generateContactId() {
  const contacts = getContacts();
  return contacts.length + 1;
}

// Función que agrega un nuevo contacto a la lista
function addContact(contact) {
  const contacts = getContacts();
  contacts.push(contact);
  saveContacts(contacts);
  showMessage("Contacto agregado exitosamente.");
  loadContactList();
}

// Función que actualiza un contacto existente en la lista
function updateContact(updatedContact) {
  const contacts = getContacts();
  const index = contacts.findIndex(
    (contact) => contact.id == updatedContact.id
  );
  if (index !== -1) {
    contacts[index] = updatedContact;
    saveContacts(contacts);
    showMessage("Contacto actualizado exitosamente.");
    loadContactList();
  }
}

// Función que solicita confirmación antes de eliminar un contacto
function deleteContact(id) {
  const confirmation = confirm(
    "¿Estás seguro de que quieres eliminar este contacto?"
  );
  if (!confirmation) {
    return;
  }

  // Elimina el contacto y actualiza la interfaz
  const contacts = getContacts();
  const filteredContacts = contacts.filter((contact) => contact.id != id);
  saveContacts(filteredContacts);
  showMessage("Contacto eliminado exitosamente.");
  loadContactList();
}

// Función que carga los datos de contacto en la tabla
function loadContactList() {
  const contacts = getContacts();
  const contactList = document.getElementById("contactList");
  contactList.innerHTML = "";

  // Crear la tabla
  const table = document.createElement("table");

  // Crear el encabezado de la tabla
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
      <th>Nombre</th>
      <th>Email</th>
      <th>Fecha de Nacimiento</th>
      <th>Acciones</th>
  `;
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Iterate sobre la lista de contactos y crea filas de tabla con datos de nombre, email, fecha de nacimiento y botones para editar y eliminar
  for (const contact of contacts) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.email}</td>
        <td>${formatDate(contact.birthdate)}</td>
        <td>
          <button onclick="editContact(${contact.id})">Editar</button>
          <button onclick="deleteContact(${contact.id})">Eliminar</button>
        </td>
    `;
    table.appendChild(tr);
  }

  // Adjuntar la tabla a contactList
  contactList.appendChild(table);
}

// Función que carga los datos del contacto en el formulario para su edición
function editContact(id) {
  const contacts = getContacts();
  const contact = contacts.find((contact) => contact.id == id);

  // Si se encuentra el contacto, llena el formulario con sus datos y habilita el botón de actualización
  if (contact) {
    document.getElementById("name").value = contact.name;
    document.getElementById("email").value = contact.email;
    document.getElementById("birthdate").value = contact.birthdate;

    document.getElementById("addButton").disabled = true;
    document.getElementById("updateButton").disabled = false;

    // Establece atributos en el formulario para su identificación durante la actualización
    document
      .getElementById("contactForm")
      .setAttribute("data-action", "update");
    document.getElementById("contactForm").setAttribute("data-id", id);
  }
}

// Función que limpia el formulario y los atributos asociados
function clearForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactForm").removeAttribute("data-action");
  document.getElementById("contactForm").removeAttribute("data-id");
}

// Función que obtiene la lista de contactos desde el almacenamiento local
function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

// Función que guarda la lista de contactos en el almacenamiento local
function saveContacts(contacts) {
  if (contacts.length === 0) {
    localStorage.removeItem("contacts");
  } else {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }
}

// Función que muestra un mensaje de alerta
function showMessage(message) {
  alert(message);
}

// Función para formatear la fecha al formato día, mes, año
function formatDate(dateString) {
  // Parseamos la fecha en el formato esperado por el navegador
  const dateParts = dateString.split("-"); // Suponiendo que la fecha está en el formato 'YYYY-MM-DD'
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // Construimos la fecha en la zona horaria local del usuario
  const date = new Date(year, month - 1, day); // Restamos 1 al mes ya que JavaScript cuenta los meses desde 0 (enero es 0)

  // Obtenemos los componentes de la fecha en el formato deseado
  const formattedDay = ("0" + date.getDate()).slice(-2); // Obtener el día con dos dígitos
  const formattedMonth = ("0" + (date.getMonth() + 1)).slice(-2); // Obtener el mes con dos dígitos
  const formattedYear = date.getFullYear();

  // Construimos y retornamos la fecha formateada
  return `${formattedDay}/${formattedMonth}/${formattedYear}`;
}
