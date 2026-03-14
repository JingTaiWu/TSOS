export interface ExampleProgram {
  name: string;
  description: string;
  code: string;
}

export const EXAMPLE_PROGRAMS: ExampleProgram[] = [
  {
    name: 'Example 1',
    description: 'Variable declarations and printing',
    code: '{\n\tint a\n\ta = 0\n\tint b\n\tb = 0\n\tprint(b)\n\tstring c\n\tstring d\n\tprint(a)\n}$',
  },
  {
    name: 'Example 2',
    description: 'Scoping, strings, and conditionals',
    code: '{\n\tint a\n\ta = 1\n\t{\n\t\tint a\n\t\tprint(a)\n\t}\n\tstring b\n\tb = \"alan\"\n\tif (a == 1) {\n\t\tprint(b)\n\t}\n\tstring c\n\tc = \"james\"\n\tb = \"blackstone\"\n\tprint(b)\n}$',
  },
  {
    name: 'Example 3',
    description: 'Duplicate variable error',
    code: '{\n\tint a\n\tstring a\n\tboolean a\n}$',
  },
  {
    name: 'Example 4',
    description: 'While loop (==)',
    code: '{\n\tint a\n\ta = 0\n\tint b\n\tb = 5\n\twhile (a == 0) {\n\t\tprint(a)\n\t\ta = 1\n\t}\n\tprint(b)\n}$',
  },
  {
    name: 'Example 5',
    description: 'While loop (!=)',
    code: '{\n\tint a\n\ta = 0\n\tint b\n\tb = 1\n\twhile (a != b) {\n\t\tprint(a)\n\t\ta = 1\n\t}\n\tprint(b)\n}$',
  },
];
