const fieldsContainer = document.getElementById("fields");
const preview = document.getElementById("preview");
const apiLink = document.getElementById("api-link");
const url = document.querySelector("meta[name='app-url']").content;
const headersContainer = document.getElementById("headers");

function createField(parent = fieldsContainer) {
  const row = document.createElement("div");
  row.classList.add("field-row");

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Field name";

  const select = document.createElement("select");
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

  const configInput = document.createElement("input");
  configInput.placeholder = "Config (optional)";

  const nestedContainer = document.createElement("div");
  nestedContainer.classList.add("nested");
  nestedContainer.style.display = "none";

  const addNestedBtn = document.createElement("button");
  addNestedBtn.textContent = "+";
  addNestedBtn.type = "button";
  addNestedBtn.style.display = "none";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "x";
  removeBtn.type = "button";
  removeBtn.classList.add("remove-btn");

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

  // onchange type
  select.onchange = () => {
    if (select.value === "object") {
      nestedContainer.style.display = "block";
      addNestedBtn.style.display = "inline-block";
      configInput.disabled = true;
      configInput.value = "";
    } else if (select.value === "array") {
      nestedContainer.style.display = "block";
      addNestedBtn.style.display = "inline-block";
      configInput.disabled = false;
      configInput.placeholder = "Array length (default 1)";
    } else {
      nestedContainer.style.display = "none";
      addNestedBtn.style.display = "none";
      configInput.disabled = false;
      configInput.placeholder = "Config (optional)";
    }
    updatePreview();
  };

  [nameInput, select, configInput].forEach((el) =>
    el.addEventListener("input", updatePreview)
  );

  row.appendChild(nameInput);
  row.appendChild(select);
  row.appendChild(configInput);
  row.appendChild(addNestedBtn);
  row.appendChild(removeBtn);

  parent.appendChild(row);
  parent.appendChild(nestedContainer);
}

function buildSchema(container) {
  const schema = {};
  [...container.querySelectorAll(":scope > .field-row")].forEach((row) => {
    const nameInput = row.children[0];
    const select = row.children[1];
    const configInput = row.children[2];
    const nestedContainer = row.nextElementSibling;

    const key = nameInput.value || "field";

    if (select.value === "object") {
      schema[key] = buildSchema(nestedContainer);
    } else if (select.value === "array") {
      schema[key] = [buildSchema(nestedContainer)];
      schema[key]._length = configInput.value || 1; // simpen info jumlah di preview schema
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
      const len = val._length || 1; // ambil length
      parts.push(...schemaToQuery(arrSchema, prefix + `${key}[${len}].`));
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
  row.classList.add("header-row");

  const keyInput = document.createElement("input");
  keyInput.placeholder = "Header key";

  const valInput = document.createElement("input");
  valInput.placeholder = "Header value";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "x";
  removeBtn.type = "button";
  removeBtn.classList.add("remove-btn");

  removeBtn.onclick = (e) => {
    e.preventDefault();
    parent.removeChild(row);
    updatePreview();
  };

  [keyInput, valInput].forEach((el) =>
    el.addEventListener("input", updatePreview)
  );

  row.appendChild(keyInput);
  row.appendChild(valInput);
  row.appendChild(removeBtn);

  parent.appendChild(row);
}

function buildHeaders(container) {
  const headers = [];
  [...container.querySelectorAll(".header-row")].forEach((row) => {
    const key = row.children[0].value.trim();
    const val = row.children[1].value.trim();
    if (key && val) {
      headers.push(`${key}:${val}`);
    }
  });
  return headers;
}

// init
createField();
updatePreview();
