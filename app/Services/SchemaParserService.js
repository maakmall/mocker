export default class SchemaParserService {
  parse(schemaString) {
    try {
      const fields = schemaString.split(";");
      const schema = {};

      fields.forEach((field) => {
        const [path, typeWithParam] = field.split(":");
        const keys = path.split(".");

        let type = typeWithParam.trim();
        let params = {};

        // check parameter ()
        const paramMatch = typeWithParam.match(/\((.*)\)$/);
        if (paramMatch) {
          type = typeWithParam.replace(/\(.*\)$/, "").trim();
          const paramStr = paramMatch[1].trim();

          // if exist "=" → named param
          if (paramStr.includes("=")) {
            params = {};
            paramStr.split(",").forEach((p) => {
              const [rawK, rawV] = p.split("=");
              const k = rawK.trim();
              const v = isNaN(rawV) ? rawV.trim() : Number(rawV);

              // check nested key like length.min
              if (k.includes(".")) {
                const parts = k.split(".");
                let cur = params;

                parts.forEach((part, i) => {
                  if (i === parts.length - 1) {
                    cur[part] = v;
                  } else {
                    if (!cur[part]) cur[part] = {};
                    cur = cur[part];
                  }
                });
              } else {
                params[k] = v;
              }
            });
          } else {
            // ordered param → array
            params = paramStr
              .split(",")
              .map((v) => (isNaN(v) ? v.trim() : Number(v)));
          }
        }

        // create nested object based on path
        let current = schema;
        keys.forEach((k, i) => {
          if (i === keys.length - 1) {
            current[k] = { type, params };
          } else {
            if (!current[k]) current[k] = {};
            current = current[k];
          }
        });
      });

      return schema;
    } catch {
      throw new Error("Invalid schema");
    }
  }

  parseHeader(headerString) {
    try {
      const headers = {};
      const raw = decodeURIComponent(headerString); // decode urlencoded

      raw.split("|").forEach((h) => {
        const [key, ...valParts] = h.split(":");
        const value = valParts.join(":").trim();
        if (key && value) headers[key.trim()] = value;
      });

      return headers;
    } catch {
      throw new Error("Invalid schema");
    }
  }
}
