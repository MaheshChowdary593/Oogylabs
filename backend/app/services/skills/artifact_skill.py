import re
from typing import Optional, Dict, Any

class ArtifactSkill:
    """
    Skill for detecting and creating structured Markdown and HTML/CSS artifacts.
    Output delimiter format:
    <<<ARTIFACT title="Artifact Title" type="html|markdown">>>
    Content here...
    <<<END_ARTIFACT>>>
    """

    SYSTEM_INSTRUCTIONS = """When the user explicitly asks for a document, essay, cheatsheet, framework summary, HTML card, or visual component, format the main output inside an ARTIFACT block so it can be natively rendered in the side-by-side Artifact Viewer.

FORMAT SPECIFICATION:
<<<ARTIFACT title="Descriptive Title" type="markdown|html">>>
[Complete Markdown document or Complete HTML/CSS code snippet]
<<<END_ARTIFACT>>>

RULES FOR HTML ARTIFACTS:
- HTML must be self-contained with inline `<style>` tags.
- Use modern CSS (CSS Grid/Flexbox, clean dark/light themes, modern sans-serif fonts, smooth rounded borders).
- Treat HTML as self-contained widget, dashboard, or card. Do not include unneeded external dependencies.
"""

    @staticmethod
    def parse_artifact_from_text(text: str) -> Optional[Dict[str, Any]]:
        """
        Parses artifact delimiter from LLM streaming response text.
        Returns dict with title, artifact_type, content, clean_text if found.
        """
        pattern = r'<<<ARTIFACT\s+title="([^"]+)"\s+type="(markdown|html)">>>\s*(.*?)\s*<<<END_ARTIFACT>>>'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            title = match.group(1)
            artifact_type = match.group(2)
            content = match.group(3)
            clean_text = re.sub(pattern, f"\n*[Generated Artifact: **{title}** (Opened in Artifact Viewer)]*\n", text, flags=re.DOTALL)
            return {
                "title": title,
                "artifact_type": artifact_type,
                "content": content,
                "clean_text": clean_text
            }
        return None
