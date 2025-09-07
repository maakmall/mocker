import { Faker, FakerError, allLocales } from "@faker-js/faker";

export default class FakerService {
  constructor() {
    this.faker = new Faker({
      locale: [
        allLocales[process.env.FAKER_LOCALE],
        allLocales["en"],
        allLocales["base"],
      ],
    });
  }

  generate(schema) {
    const traverse = (sc) => {
      // case: object { type, params }
      if (typeof sc === "object" && sc !== null && sc.type) {
        const [namespace, method] = sc.type.split(".");
        if (
          this.faker[namespace] &&
          typeof this.faker[namespace][method] === "function"
        ) {
          if (sc.params) {
            if (Array.isArray(sc.params)) {
              // ordered params
              return this.faker[namespace][method](...sc.params);
            } else if (
              typeof sc.params === "object" &&
              Object.keys(sc.params).length !== 0
            ) {
              // named params
              return this.faker[namespace][method](sc.params);
            }
          }
          // without param
          return this.faker[namespace][method]();
        }
        throw new FakerError(`Invalid faker type ${sc.type}`);
      }

      // case: object → recurse child
      if (typeof sc === "object" && sc !== null) {
        const result = {};
        for (const key in sc) {
          const arrayMatch = key.match(/(.+)\[(\d*)\]$/);
          if (arrayMatch) {
            // key array format
            const name = arrayMatch[1];
            const count = arrayMatch[2] ? parseInt(arrayMatch[2], 10) : 1; // default 1 if empty
            result[name] = Array.from({ length: count }, () =>
              traverse(sc[key])
            );
          } else {
            result[key] = traverse(sc[key]);
          }
        }
        return result;
      }

      // fallback
      return sc;
    };

    return traverse(schema);
  }

  getModules() {
    const namespaces = Object.keys(this.faker);

    const blacklist = [
      "helpers",
      "_randomizer",
      "definitions",
      "rawDefinitions",
    ];

    const mapping = {};

    for (const ns of namespaces.sort()) {
      if (typeof this.faker[ns] === "object" && !blacklist.includes(ns)) {
        mapping[ns] = Object.keys(this.faker[ns])
          .filter((k) => typeof this.faker[ns][k] === "function")
          .sort();
      }
    }

    return mapping;
  }
}
