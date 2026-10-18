#!/usr/bin/env python3
"""Run only the method-owned tests, independently of product test discovery."""
from __future__ import annotations

import argparse
import importlib
from importlib.abc import MetaPathFinder
from importlib.util import spec_from_file_location
from pathlib import Path
import sys
import unittest

from method_files import test_files

ROOT = Path(__file__).resolve().parents[1]


class DeclaredTests(MetaPathFinder):
    """Resolve declared sibling imports to files before any product packages."""
    def __init__(self, origins: dict[str, Path]):
        self.origins = origins

    def find_spec(self, fullname, path=None, target=None):
        if fullname in self.origins:
            return spec_from_file_location(fullname, self.origins[fullname])
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()
    try:
        tests = test_files(ROOT)
    except (OSError, ValueError, TypeError) as error:
        print(f"Cannot load method tests: {error}", file=sys.stderr)
        return 1
    origins = {Path(relative).stem: ROOT / relative for relative in tests}
    previous = {name: sys.modules.pop(name) for name in origins if name in sys.modules}
    finder = DeclaredTests(origins)
    sys.meta_path.insert(0, finder)
    try:
        suite = unittest.TestSuite(unittest.defaultTestLoader.loadTestsFromModule(importlib.import_module(name))
                                   for name in origins)
        result = unittest.TextTestRunner(verbosity=2 if args.verbose else 1).run(suite)
        return 0 if result.wasSuccessful() else 1
    finally:
        sys.meta_path.remove(finder)
        for name in origins:
            sys.modules.pop(name, None)
        sys.modules.update(previous)


if __name__ == "__main__":
    raise SystemExit(main())
