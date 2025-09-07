const fieldsContainer = document.getElementById("fields");
const preview = document.getElementById("preview");
const apiLink = document.getElementById("api-link");
const url = document.querySelector("meta[name='app-url']").content;
const headersContainer = document.getElementById("headers");

function createField(parent = fieldsContainer) {
  const row = document.createElement("div");
  row.classList.add("field-row", "row", "g-3", "mb-3", "align-items-center");

  // field name
  const inputWrapper = document.createElement("div");
  inputWrapper.classList.add("col-3");
  const nameInput = document.createElement("input");
  nameInput.classList.add("form-control");
  nameInput.placeholder = "Field name";
  inputWrapper.appendChild(nameInput);

  // main type select
  const selectWrapper = document.createElement("div");
  selectWrapper.classList.add("col-2");
  const select = document.createElement("select");
  select.classList.add("form-select");
  select.appendChild(new Option("-- Select type --", "", true, true));
  ["array", "object"].forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
  for (const ns in fakerModules) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = ns;
    fakerModules[ns].forEach((fn) => {
      const o = document.createElement("option");
      o.value = `${ns}.${fn}`;
      o.textContent = `${ns}.${fn}`;
      optGroup.appendChild(o);
    });
    select.appendChild(optGroup);
  }
  selectWrapper.appendChild(select);

  // array type select
  const arrayTypeWrapper = document.createElement("div");
  arrayTypeWrapper.classList.add("col-2", "d-none");
  const arrayTypeSelect = document.createElement("select");
  arrayTypeSelect.classList.add("form-select");
  arrayTypeSelect.innerHTML = `
    <option value="object" selected>Array of Objects</option>
    <option value="faker">Array of Values</option>
  `;
  arrayTypeWrapper.appendChild(arrayTypeSelect);

  // faker select khusus array of faker
  const fakerWrapper = document.createElement("div");
  fakerWrapper.classList.add("col-2", "d-none");
  const fakerSelect = document.createElement("select");
  fakerSelect.classList.add("form-select");
  fakerSelect.appendChild(new Option("-- Select faker --", "", true, true));
  for (const ns in fakerModules) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = ns;
    fakerModules[ns].forEach((fn) => {
      const o = document.createElement("option");
      o.value = `${ns}.${fn}`;
      o.textContent = `${ns}.${fn}`;
      optGroup.appendChild(o);
    });
    fakerSelect.appendChild(optGroup);
  }
  fakerWrapper.appendChild(fakerSelect);

  // config input
  const configWrapper = document.createElement("div");
  configWrapper.classList.add("col-2");
  const configInput = document.createElement("input");
  configInput.classList.add("form-control");
  configInput.placeholder = "Config (optional)";
  configWrapper.appendChild(configInput);

  // action buttons
  const actionBtnWrapper = document.createElement("div");
  actionBtnWrapper.classList.add("col-auto", "ms-auto", "text-end");
  const addNestedBtn = document.createElement("button");
  addNestedBtn.classList.add("btn", "btn-primary", "me-2");
  addNestedBtn.textContent = "+";
  addNestedBtn.type = "button";
  addNestedBtn.style.display = "none";
  const removeBtn = document.createElement("button");
  removeBtn.classList.add("btn", "btn-danger");
  removeBtn.textContent = "x";
  removeBtn.type = "button";
  actionBtnWrapper.appendChild(addNestedBtn);
  actionBtnWrapper.appendChild(removeBtn);

  const nestedContainer = document.createElement("div");
  nestedContainer.classList.add("ms-4");
  nestedContainer.style.display = "none";

  // onchange type
  select.onchange = () => {
    if (select.value === "object") {
      nestedContainer.style.display = "block";
      addNestedBtn.style.display = "inline-block";
      configWrapper.classList.add("d-none");
      arrayTypeWrapper.classList.add("d-none");
      fakerWrapper.classList.add("d-none");
    } else if (select.value === "array") {
      nestedContainer.style.display = "block";
      addNestedBtn.style.display = "inline-block";
      configWrapper.classList.remove("d-none");
      arrayTypeWrapper.classList.remove("d-none");
      configInput.placeholder = "Array length (default 1)";
    } else {
      nestedContainer.style.display = "none";
      addNestedBtn.style.display = "none";
      configWrapper.classList.remove("d-none");
      arrayTypeWrapper.classList.add("d-none");
      fakerWrapper.classList.add("d-none");
      configInput.placeholder = "Config (optional)";
    }
    updatePreview();
  };

  arrayTypeSelect.onchange = () => {
    if (arrayTypeSelect.value === "faker") {
      fakerWrapper.classList.remove("d-none");
      nestedContainer.style.display = "none";
      addNestedBtn.style.display = "none";
    } else {
      fakerWrapper.classList.add("d-none");
      nestedContainer.style.display = "block";
      addNestedBtn.style.display = "inline-block";
    }
    updatePreview();
  };

  // event nested
  addNestedBtn.onclick = (e) => {
    e.preventDefault();
    createField(nestedContainer);
    updatePreview();
  };

  // event hapus row
  removeBtn.onclick = (e) => {
    e.preventDefault();
    parent.removeChild(row);
    parent.removeChild(nestedContainer);
    updatePreview();
  };

  [nameInput, select, configInput, arrayTypeSelect, fakerSelect].forEach((el) =>
    el.addEventListener("input", updatePreview)
  );

  // append
  row.appendChild(inputWrapper);
  row.appendChild(selectWrapper);
  row.appendChild(arrayTypeWrapper);
  row.appendChild(fakerWrapper);
  row.appendChild(configWrapper);
  row.appendChild(actionBtnWrapper);

  parent.appendChild(row);
  parent.appendChild(nestedContainer);
}

function buildSchema(container) {
  const schema = {};
  [...container.querySelectorAll(":scope > .field-row")].forEach((row) => {
    const nameInput = row.children[0].querySelector("input");
    const select = row.children[1].querySelector("select");
    const arrayTypeSelect = row.children[2].querySelector("select");
    const fakerSelect = row.children[3].querySelector("select");
    const configInput = row.children[4].querySelector("input");
    const nestedContainer = row.nextElementSibling;

    const key = nameInput.value || "field";

    if (select.value === "object") {
      schema[key] = buildSchema(nestedContainer);
    } else if (select.value === "array") {
      const arrayType = arrayTypeSelect?.value || "object";
      if (arrayType === "object") {
        schema[key] = [buildSchema(nestedContainer)];
      } else if (arrayType === "faker") {
        schema[key] = [fakerSelect?.value || "string.uuid"];
      }
      schema[key]._length = configInput.value || 1;
    } else {
      schema[key] = `${select.value}${
        configInput.value ? "(" + configInput.value + ")" : ""
      }`;
    }
  });
  return schema;
}

function schemaToQuery(schema, prefix = "") {
  let parts = [];
  for (const key in schema) {
    const val = schema[key];
    if (typeof val === "object" && !Array.isArray(val)) {
      parts.push(...schemaToQuery(val, prefix + key + "."));
    } else if (Array.isArray(val)) {
      const arrSchema = val[0];
      const len = val._length || 1;
      if (typeof arrSchema === "object") {
        parts.push(...schemaToQuery(arrSchema, prefix + `${key}[${len}].`));
      } else if (typeof arrSchema === "string") {
        parts.push(`${prefix}${key}[${len}]:${arrSchema}`);
      }
    } else if (typeof val === "string") {
      parts.push(`${prefix}${key}:${val}`);
    }
  }
  return parts;
}

function updatePreview() {
  const schema = buildSchema(fieldsContainer);

  // hapus _length di preview json
  const cleanSchema = JSON.parse(
    JSON.stringify(schema, (k, v) => (k === "_length" ? undefined : v))
  );

  preview.textContent = JSON.stringify(cleanSchema, null, 2);

  const query = schemaToQuery(schema).join(";");

  // headers
  const headers = buildHeaders(headersContainer);
  const headerQuery = headers.length
    ? `&h=${encodeURIComponent(headers.join("|"))}`
    : "";

  // status code
  const statusCode = document.getElementById("status-code").value.trim();
  const statusQuery = statusCode ? `&c=${encodeURIComponent(statusCode)}` : "";

  apiLink.textContent = `${url}/api?s=${query}${statusQuery}${headerQuery}`;
}

document.getElementById("add-field").onclick = (e) => {
  e.preventDefault();
  createField();
  updatePreview();
};

document.getElementById("add-header").onclick = (e) => {
  e.preventDefault();
  createHeader();
  updatePreview();
};

document.getElementById("status-code").addEventListener("input", updatePreview);

document.getElementById("copy-url").addEventListener("click", () => {
  const copyLink = apiLink.textContent;

  if (copyLink) {
    navigator.clipboard
      .writeText(copyLink)
      .then(() => {
        alert("URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  } else {
    alert("No URL to copy!");
  }
});

// create header row
function createHeader(parent = headersContainer) {
  const row = document.createElement("div");
  row.classList.add("header-row", "row", "mb-3");

  const keyInputWrapper = document.createElement("div");
  keyInputWrapper.classList.add("col");
  const keyInput = document.createElement("input");
  keyInput.classList.add("form-control");
  keyInput.placeholder = "Header key";
  keyInputWrapper.appendChild(keyInput);

  const valInputWrapper = document.createElement("div");
  valInputWrapper.classList.add("col");
  const valInput = document.createElement("input");
  valInput.classList.add("form-control");
  valInput.placeholder = "Header value";
  valInputWrapper.appendChild(valInput);

  const removeBtnWrapper = document.createElement("div");
  removeBtnWrapper.classList.add("col");
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "x";
  removeBtn.type = "button";
  removeBtn.classList.add("btn", "btn-danger");
  removeBtnWrapper.appendChild(removeBtn);

  removeBtn.onclick = (e) => {
    e.preventDefault();
    parent.removeChild(row);
    updatePreview();
  };

  [keyInput, valInput].forEach((el) =>
    el.addEventListener("input", updatePreview)
  );

  row.appendChild(keyInputWrapper);
  row.appendChild(valInputWrapper);
  row.appendChild(removeBtnWrapper);

  parent.appendChild(row);
}

function buildHeaders(container) {
  const headers = [];
  [...container.querySelectorAll(".header-row")].forEach((row) => {
    const key = row.children[0].querySelector("input").value.trim();
    const val = row.children[1].querySelector("input").value.trim();
    if (key && val) {
      headers.push(`${key}:${val}`);
    }
  });
  return headers;
}

// init
createField();
updatePreview();
