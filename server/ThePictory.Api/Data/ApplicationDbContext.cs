using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Models;

namespace ThePictory.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<AdminOtpCode> AdminOtpCodes => Set<AdminOtpCode>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<Movie> Movies => Set<Movie>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<MediaItem>()
            .HasOne(m => m.Category)
            .WithMany(c => c.MediaItems)
            .HasForeignKey(m => m.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AdminUser>()
            .HasIndex(a => a.Username)
            .IsUnique();

        modelBuilder.Entity<AdminOtpCode>()
            .HasIndex(o => o.Ticket)
            .IsUnique();

        modelBuilder.Entity<AdminOtpCode>()
            .HasOne(o => o.AdminUser)
            .WithMany(a => a.OtpCodes)
            .HasForeignKey(o => o.AdminUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
