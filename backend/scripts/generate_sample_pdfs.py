import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.api.demo import DEMO_CANDIDATES

def generate_pdf(candidate_data, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1d4ed8"),
        fontName="Helvetica-Bold",
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4
    )

    story = []
    
    # Header
    story.append(Paragraph(candidate_data['name'], title_style))
    contact_text = f"Email: {candidate_data['email']} | Phone: {candidate_data['phone']} | Location: {candidate_data['location']}"
    story.append(Paragraph(contact_text, subtitle_style))
    story.append(Spacer(1, 8))

    # Summary
    story.append(Paragraph("EXECUTIVE SUMMARY", heading_style))
    story.append(Paragraph(candidate_data['summary'], body_style))
    story.append(Spacer(1, 6))

    # Skills
    story.append(Paragraph("TECHNICAL SKILLS", heading_style))
    for cat, items in candidate_data['skills'].items():
        cat_title = cat.replace('_', ' ').title()
        skill_line = f"<b>{cat_title}:</b> {', '.join(items)}"
        story.append(Paragraph(skill_line, body_style))
    story.append(Spacer(1, 6))

    # Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
    for exp in candidate_data['experience']:
        role_header = f"<b>{exp['role']}</b> — {exp['company']} <i>({exp['duration']})</i>"
        story.append(Paragraph(role_header, body_style))
        for r in exp['responsibilities']:
            story.append(Paragraph(f"• {r}", body_style))
        story.append(Spacer(1, 4))

    # Projects
    story.append(Paragraph("KEY PROJECTS", heading_style))
    for proj in candidate_data['projects']:
        proj_header = f"<b>{proj['name']}</b> (Tech: {', '.join(proj['technologies'])})"
        story.append(Paragraph(proj_header, body_style))
        story.append(Paragraph(proj['description'], body_style))
        story.append(Spacer(1, 4))

    # Education
    story.append(Paragraph("EDUCATION", heading_style))
    for edu in candidate_data['education']:
        story.append(Paragraph(f"<b>{edu['degree']}</b>, {edu['institution']} ({edu['graduation_year']})", body_style))

    # Certifications
    if candidate_data.get('certifications'):
        story.append(Paragraph("CERTIFICATIONS", heading_style))
        for cert in candidate_data['certifications']:
            story.append(Paragraph(f"• {cert['name']} — {cert['issuer']} ({cert.get('year', '2023')})", body_style))

    doc.build(story)
    print(f"Generated PDF: {output_path}")

if __name__ == "__main__":
    targets = [
        "./data/sample_resumes",
        "../data/sample_resumes"
    ]
    for target in targets:
        os.makedirs(target, exist_ok=True)
        for c in DEMO_CANDIDATES:
            pdf_name = c['resume_filename']
            out_file = os.path.join(target, pdf_name)
            generate_pdf(c, out_file)
