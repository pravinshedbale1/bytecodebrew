# LLD reference solutions

One self-contained Java file per LLD case study in the ByteCodeBrew course
(`src/content/system-design/lld/lld-*.mdx`). Each file holds the full design from its
lesson and a `main` that runs the lesson's scenarios as checks, including multi-threaded race tests.

```bash
./lld-java/run-all.sh                         # everything
java lld-java/parking-lot/ParkingLot.java     # one case study
```

Requires JDK 21 or newer (developed on JDK 25). No build tool or dependencies.
`schema-design/verify.sh` runs the SQL from the schema lesson against a throwaway PostgreSQL
instance (PostgreSQL 13+ binaries needed); `run-all.sh` runs it when PostgreSQL is installed.

The lessons show excerpts of these files. When you change a lesson's code, change the
matching file here and rerun it.
