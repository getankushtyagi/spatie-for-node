import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { MediaConversion } from './media-conversion.entity';

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    fileName!: string;

    @Column()
    mimeType!: string;

    @Column()
    size!: number;

    @Column()
    disk!: string;

    @Column()
    path!: string;

    @Column()
    url!: string;

    @Column({ default: 'default' })
    collection!: string;

    @Column({ nullable: true })
    alt!: string;

    @Column({ nullable: true })
    title!: string;

    @Column('json', { nullable: true })
    customProperties!: Record<string, any>;

    @OneToMany(() => MediaConversion, conversion => conversion.media, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    conversions!: MediaConversion[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}