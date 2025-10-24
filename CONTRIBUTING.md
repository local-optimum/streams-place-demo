# Contributing to Streams Place

Thank you for your interest in contributing! This is a demo project showcasing Somnia Data Streams, and we welcome improvements.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Set up `.env.local` (see [docs/QUICKSTART.md](./docs/QUICKSTART.md))
5. Create a branch: `git checkout -b feature/your-feature`

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow existing code structure
- Use meaningful variable names
- Add comments for complex logic
- Run `npm run lint` before committing

### Commit Messages

Use descriptive commit messages with prefixes:

```
feat: Add canvas zoom functionality
fix: Resolve cooldown timer bug
docs: Update quickstart guide
refactor: Simplify pixel encoding
```

## Submitting Changes

1. Ensure code builds: `npm run build`
2. Check linting: `npm run lint`
3. Type check: `npm run type-check`
4. Submit PR with clear description

## Reporting Issues

Open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, Node version)

## Questions?

- Check [docs/QUICKSTART.md](./docs/QUICKSTART.md)
- Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Open an issue with the `question` label

## License

By contributing, you agree your contributions will be licensed under the MIT License.
